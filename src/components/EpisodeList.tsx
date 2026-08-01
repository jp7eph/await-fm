import episodes from "../episodes.json";
import type { Episode } from "../types";

const SHOW_URL = "https://open.spotify.com/show/1EdEzpjF1NB27op0TF69t4";

export function EpisodeList() {
  return (
    <section className="pt-10 mx-auto max-w-7xl pb-4 px-4 sm:px-8">
      <div className="max-w-xl mx-auto mb-4 text-center">
        <h3 className="text-gray-800 text-3xl font-semibold md:text-4xl">Episodes</h3>
      </div>
      <div className="max-w-3xl mx-auto">
        {(episodes.episodes as Episode[]).map((episode) => (
          <div key={episode.id} className="mb-10">
            {episode.embedSrc ? (
              // sandbox を付けない: Spotify 公式 embed コードに従う (付与すると再生が壊れる可能性があり未検証)
              <iframe
                data-testid="embed-iframe"
                style={{ borderRadius: 12 }}
                src={episode.embedSrc}
                width="100%"
                height={152}
                frameBorder="0"
                allowFullScreen
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="mb-2"
                title={episode.title}
              />
            ) : (
              // embedSrc が無いエピソードはプレイヤーなしでタイトル + 説明のみ (抽出失敗時も一覧は空にならない)
              <a
                href={episode.link || SHOW_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-gray-800 font-semibold hover:underline mb-2"
              >
                {episode.title}
              </a>
            )}
            <span className="text-gray-500">{episode.description}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
