import { useRef, useState } from "react";
import type { Episode } from "../types";

const SKIP_SECONDS = 15;
// Spotify embed がこの番組 (await.fm) に対して算出した動的カラーをそのまま使用
// (embed の CSS 変数より: base #285775 / tinted #003550 / text-subdued #A2D4F6)
const CARD_BG = "#285775"; // 再生ボタンのアイコン色にも使用
const CARD_BACKGROUND = [
  "radial-gradient(120% 120% at 100% 0%, rgba(162, 212, 246, 0.25) 0%, transparent 55%)",
  "linear-gradient(180deg, #003550 0%, #285775 100%)",
].join(", ");
const TEXT_COLOR = "#ffffff";
const MUTED_COLOR = "#a2d4f6"; // Spotify の text-subdued と同じ (日付行)
const COVER_PATH = "cover.jpg";
const SHOW_URL = "https://open.spotify.com/show/1EdEzpjF1NB27op0TF69t4"; // 番組ページ (link が無い時のフォールバック兼用)

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return ""; // publishedAt 欠落時のクラッシュ防止
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-0.5">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  );
}

function SkipBackIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
      <path d="M2.464 4.5h1.473a.75.75 0 0 1 0 1.5H0V2.063a.75.75 0 0 1 1.5 0v1.27a8.25 8.25 0 1 1 10.539 12.554.75.75 0 0 1-.828-1.25A6.75 6.75 0 1 0 2.464 4.5" />
      <path d="M0 10.347V9.291q1.045-.077 1.507-.385.473-.308.583-.913h1.32v7.81H1.903v-5.456zm7.322 5.643q-.814 0-1.463-.297a2.46 2.46 0 0 1-1.023-.869q-.375-.583-.396-1.386h1.518q.01.363.176.638.165.274.45.43.287.153.66.153.385 0 .672-.176.297-.176.45-.495.165-.319.166-.726 0-.407-.165-.715a1.14 1.14 0 0 0-.451-.495 1.25 1.25 0 0 0-.671-.176q-.43 0-.748.21a1.23 1.23 0 0 0-.462.516H4.56L5 7.993h4.642V9.39H6.207l-.211 2.134q.086-.162.237-.319a1.8 1.8 0 0 1 .616-.407q.373-.154.814-.154.681 0 1.22.308.55.309.859.88.308.572.308 1.331 0 .792-.33 1.441-.33.639-.957 1.012-.616.375-1.441.374" />
    </svg>
  );
}

function SkipForwardIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
      <path d="M13.536 4.488h-1.473a.75.75 0 1 0 0 1.5H16V2.051a.75.75 0 0 0-1.5 0v1.27A8.25 8.25 0 1 0 3.962 15.876a.75.75 0 0 0 .826-1.252 6.75 6.75 0 1 1 8.747-10.136Z" />
      <path d="M11.81 15.681q.65.297 1.464.297.825 0 1.44-.374.628-.374.958-1.012.33-.649.33-1.44 0-.76-.308-1.332a2.16 2.16 0 0 0-.858-.88 2.4 2.4 0 0 0-1.221-.308q-.44 0-.814.154a1.8 1.8 0 0 0-.616.407q-.15.157-.237.319l.211-2.134h3.436V7.981h-4.642l-.44 4.61h1.474a1.24 1.24 0 0 1 .462-.518q.318-.21.748-.209.384 0 .67.176.298.177.452.495.165.309.165.715 0 .408-.165.726a1.14 1.14 0 0 1-.451.495 1.25 1.25 0 0 1-.671.176q-.375 0-.66-.154a1.16 1.16 0 0 1-.451-.429 1.3 1.3 0 0 1-.176-.638h-1.518q.021.804.396 1.386a2.46 2.46 0 0 0 1.023.87Zm-5.858-5.346V9.28q1.045-.077 1.507-.385.473-.308.583-.913h1.32v7.81H7.855v-5.456z" />
    </svg>
  );
}

export function EpisodePlayer({ episode }: { episode: Episode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(episode.durationSeconds || 0);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      void audio.play();
    } else {
      audio.pause();
    }
  };

  const seek = (value: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value;
    setCurrentTime(value);
  };

  const skip = (delta: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const max = audio.duration || episode.durationSeconds || 0;
    const next = Math.max(0, Math.min(max, audio.currentTime + delta));
    audio.currentTime = next;
    setCurrentTime(next);
  };

  return (
    <div
      className="flex gap-4 items-center p-4 rounded-xl"
      style={{ background: CARD_BACKGROUND, color: TEXT_COLOR }}
    >
      <a
        href={episode.link || SHOW_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0"
      >
        <img
          src={COVER_PATH}
          alt=""
          loading="lazy"
          className="w-24 h-24 rounded-lg object-cover shrink-0"
        />
      </a>
      <div className="flex-1 min-w-0">
        <a
          href={episode.link || SHOW_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          <h4 className="font-semibold truncate">{episode.title}</h4>
        </a>
        <p className="text-sm truncate" style={{ color: MUTED_COLOR }}>
          <a href={SHOW_URL} target="_blank" rel="noopener noreferrer" className="hover:underline">
            await.fm
          </a>
          {" · "}
          {formatDate(episode.publishedAt)}
        </p>
        <div className="flex items-center gap-2 mt-3">
          <button
            type="button"
            onClick={() => skip(-SKIP_SECONDS)}
            aria-label="15秒前に戻る"
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10"
          >
            <SkipBackIcon />
          </button>
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? "一時停止" : "再生"}
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform hover:scale-105 active:scale-95"
            style={{ backgroundColor: TEXT_COLOR, color: CARD_BG }}
          >
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button
            type="button"
            onClick={() => skip(SKIP_SECONDS)}
            aria-label="15秒先に早送り"
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10"
          >
            <SkipForwardIcon />
          </button>
          <div className="flex-1">
            <input
              type="range"
              min={0}
              max={duration || 1}
              step={1}
              value={Math.min(currentTime, duration || 0)}
              onChange={(e) => seek(Number(e.target.value))}
              aria-label="再生位置"
              className="w-full"
              style={{ accentColor: TEXT_COLOR }}
            />
            <div className="flex justify-between text-xs mt-1" style={{ color: MUTED_COLOR }}>
              <span>{formatDuration(currentTime)}</span>
              <span>{formatDuration(duration)}</span>
            </div>
          </div>
        </div>
      </div>
      <audio
        ref={audioRef}
        src={episode.audioUrl}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) =>
          setDuration(e.currentTarget.duration || episode.durationSeconds || 0)
        }
        onEnded={() => setPlaying(false)}
      />
    </div>
  );
}
