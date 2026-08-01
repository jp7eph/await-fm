#!/usr/bin/env python3
"""Fetch podcast episodes and write src/episodes.json.

Sources:
  1. RSS (anchor.fm) — primary. title / topics / audioUrl / duration / pubDate / guid
  2. Apple Podcasts lookup API — fallback when the RSS fetch fails
  3. Spotify links — extracted from the public podcasters.spotify.com episode
     page (reached via the RSS <link>). Each episode object there carries
     `spotifyUrl` (https://open.spotify.com/episode/<id>), which is used for
     both the site link and the embed iframe URL (embedSrc).

Idempotent: only writes the file when the content actually changed.
Output format is generator-owned: src/episodes.json is excluded from oxfmt
(see .oxfmtrc.json) so the file never drifts from the formatter.
"""

import email.utils
import html
import json
import os
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path

RSS_URL = os.environ.get("RSS_URL", "https://anchor.fm/s/1068bb738/podcast/rss")
APPLE_LOOKUP_URL = "https://itunes.apple.com/lookup?id=1839927506&entity=podcastEpisode&limit=200"
USER_AGENT = "await-fm-episodes/1.0"

ROOT = Path(__file__).resolve().parent.parent
OUT_PATH = ROOT / "src" / "episodes.json"


def fetch(url: str, headers: dict | None = None) -> bytes:
    req = urllib.request.Request(
        url,
        headers={"User-Agent": USER_AGENT, **(headers or {})},
    )
    with urllib.request.urlopen(req, timeout=30) as res:
        return res.read()


def strip_html(text: str) -> str:
    text = re.sub(r"<[^>]+>", "", text)
    return html.unescape(text).strip()


def extract_topics(description: str) -> list[str]:
    """Extract <li> items from the RSS description HTML."""
    items = re.findall(r"<li[^>]*>(.*?)</li>", description, flags=re.DOTALL)
    topics = [strip_html(item) for item in items]
    return [t for t in topics if t]


def parse_duration(value: str | None) -> int | None:
    """'01:30:15' or '55:56' -> seconds."""
    if not value:
        return None
    parts = value.strip().split(":")
    try:
        secs = sum(int(p) * 60**i for i, p in enumerate(reversed(parts)))
    except ValueError:
        return None
    return secs


def to_iso_utc(value: str) -> str:
    dt = email.utils.parsedate_to_datetime(value)
    return dt.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")


def normalize_iso(value: str) -> str:
    """Normalize an ISO-ish date string to UTC ISO with Z suffix."""
    if value.endswith("Z"):
        return value
    return datetime.fromisoformat(value.replace("Z", "+00:00")).astimezone(timezone.utc).isoformat().replace("+00:00", "Z")


def episodes_from_rss(xml_bytes: bytes) -> list[dict]:
    root = ET.fromstring(xml_bytes)
    episodes = []
    for item in root.iter("item"):
        fields = {child.tag.split("}")[-1]: child for child in item}
        guid = fields["guid"].text.strip() if fields.get("guid") is not None and fields["guid"].text else None
        title = fields["title"].text.strip() if fields.get("title") is not None and fields["title"].text else None
        if not guid or not title:
            continue
        description_html = fields["description"].text or "" if fields.get("description") is not None else ""
        topics = extract_topics(description_html)
        enclosure = fields.get("enclosure")
        audio_url = enclosure.get("url") if enclosure is not None else None
        if not audio_url:
            continue
        link_el = fields.get("link")
        link_url = link_el.text.strip() if link_el is not None and link_el.text else None
        duration_raw = fields["duration"].text if fields.get("duration") is not None else None
        pubdate_raw = fields["pubDate"].text if fields.get("pubDate") is not None else None
        episodes.append(
            {
                "id": guid,
                "title": title,
                "topics": topics,
                "description": " / ".join(topics) if topics else strip_html(description_html),
                "link": link_url,
                "audioUrl": audio_url,
                "durationSeconds": parse_duration(duration_raw),
                "publishedAt": to_iso_utc(pubdate_raw) if pubdate_raw else None,
            }
        )
    return episodes


def episodes_from_apple(payload: dict) -> list[dict]:
    episodes = []
    for result in payload.get("results", []):
        if result.get("wrapperType") != "podcastEpisode":
            continue
        episodes.append(
            {
                "id": result.get("episodeGuid"),
                "title": result.get("trackName"),
                "description": (result.get("description") or "").strip(),
                "link": result.get("trackViewUrl"),
                "audioUrl": result.get("episodeUrl"),
                "durationSeconds": (
                    result.get("trackTimeMillis") // 1000 if result.get("trackTimeMillis") else None
                ),
                "publishedAt": normalize_iso(result["releaseDate"]) if result.get("releaseDate") else None,
            }
        )
    return episodes


def load_existing_links() -> dict[str, dict[str, str]]:
    """id -> {link, embedSrc} from the previous episodes.json.

    Spotify IDs are immutable, so previously matched episodes keep their
    embed/link even if the podcasters page stops listing them (truncation).
    """
    if not OUT_PATH.exists():
        return {}
    try:
        data = json.loads(OUT_PATH.read_text())
    except json.JSONDecodeError:
        return {}
    return {
        ep["id"]: {"link": ep.get("link"), "embedSrc": ep.get("embedSrc")}
        for ep in data.get("episodes", [])
        if ep.get("id")
    }


def _extract_json_object(text: str, pos: int) -> str | None:
    """pos を含む最内の {...} オブジェクトを返す (文字列内の {} は無視)."""
    # 後方スキャンで開始 { を特定
    depth = 0
    in_str = False
    start = None
    i = pos
    while i >= 0:
        ch = text[i]
        if in_str:
            if ch == '"' and (i == 0 or text[i - 1] != "\\"):
                in_str = False
        else:
            if ch == '"':
                in_str = True
            elif ch == "}":
                depth += 1
            elif ch == "{":
                if depth == 0:
                    start = i
                    break
                depth -= 1
        i -= 1
    if start is None:
        return None
    # 前方スキャンで対応する } を特定
    depth = 0
    in_str = False
    for i in range(start, len(text)):
        ch = text[i]
        if in_str:
            if ch == '"' and text[i - 1] != "\\":
                in_str = False
        else:
            if ch == '"':
                in_str = True
            elif ch == "{":
                depth += 1
            elif ch == "}":
                depth -= 1
                if depth == 0:
                    return text[start : i + 1]
    return None


def spotify_links_from_podcasters(html_text: str) -> dict[str, str]:
    """Map episode title -> open.spotify.com/episode/<id> URL.

    The public podcasters.spotify.com episode page embeds a JSON list of all
    episodes; each object carries both "title" and "spotifyUrl". Brace-aware
    extraction: JSON strings may contain literal braces (show notes), which a
    flat `{...}` regex would truncate.
    """
    result = {}
    for m in re.finditer(r'"spotifyUrl"', html_text):
        # キー終了直後から後方スキャン (キー開始からだと文字列内外の判定が反転する)
        obj_text = _extract_json_object(html_text, m.end())
        if obj_text is None:
            continue
        try:
            data = json.loads(obj_text)
        except json.JSONDecodeError:
            continue
        if isinstance(data, dict) and data.get("title") and data.get("spotifyUrl"):
            result[data["title"]] = data["spotifyUrl"]
    return result


def main() -> int:
    try:
        rss = fetch(RSS_URL)
        episodes = episodes_from_rss(rss)
        print(f"RSS: {len(episodes)} episodes")
        if not episodes:
            raise RuntimeError("RSS returned no episodes")
    except Exception as exc:  # noqa: BLE001 — any failure falls back
        print(f"RSS fetch failed ({exc}); falling back to Apple Podcasts API")
        apple = json.loads(fetch(APPLE_LOOKUP_URL))
        episodes = episodes_from_apple(apple)
        print(f"Apple: {len(episodes)} episodes")
        if not episodes:
            print("ERROR: no episodes from any source", file=sys.stderr)
            return 1

    # Spotify の公開 podcasters ページからエピソード ID を抽出 (ログイン/API 不要)
    first_link = episodes[0].get("link") if episodes else None
    if first_link and "podcasters.spotify.com" in first_link:
        try:
            page = fetch(first_link).decode("utf-8", errors="replace")
            links = spotify_links_from_podcasters(page)
            matched = 0
            for ep in episodes:
                url = links.get(ep["title"])
                if url:
                    ep["link"] = url
                    ep["embedSrc"] = url.replace("/episode/", "/embed/episode/") + "?utm_source=generator"
                    matched += 1
            print(f"Spotify: {matched}/{len(episodes)} episodes matched")
        except Exception as exc:  # noqa: BLE001 — keep RSS links, no embedSrc
            print(f"WARN: Spotify page fetch failed ({exc}); keeping RSS links, no embedSrc")
    else:
        print("WARN: no podcasters.spotify.com link — skipping Spotify enrichment")

    # ページが直近 N 件しか返さない場合の保険: 前回取得済みの ID を引き継ぐ
    existing = load_existing_links()
    carried = 0
    for ep in episodes:
        if "embedSrc" not in ep:
            prev = existing.get(ep["id"])
            if prev and prev.get("embedSrc"):
                ep["link"] = prev["link"] or ep["link"]
                ep["embedSrc"] = prev["embedSrc"]
                carried += 1
    if carried:
        print(f"Spotify: {carried} episode(s) carried over from previous run")

    episodes.sort(key=lambda ep: ep["publishedAt"] or "", reverse=True)
    episodes = [{k: v for k, v in ep.items() if v is not None} for ep in episodes]
    output = json.dumps({"episodes": episodes}, ensure_ascii=False, indent=2) + "\n"

    if OUT_PATH.exists() and OUT_PATH.read_text() == output:
        print("No changes — episodes.json is up to date")
        return 0
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(output)
    print(f"Wrote {OUT_PATH} ({len(episodes)} episodes)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
