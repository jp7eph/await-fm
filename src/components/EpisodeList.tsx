import episodes from "../../episodes.json";
import type { Episode } from "../types";

export function EpisodeList() {
  return (
    <section className="pt-10 mx-auto max-w-screen-xl pb-4 px-4 sm:px-8">
      <div className="max-w-xl mx-auto mb-4 text-center">
        <h3 className="text-gray-800 text-3xl font-semibold md:text-4xl">Episodes</h3>
      </div>
      <div className="max-w-3xl mx-auto">
        {(episodes.episodes as Episode[]).map((episode) => (
          <div key={episode.src} className="mb-10">
            <iframe
              data-testid="embed-iframe"
              style={{ borderRadius: 12 }}
              src={episode.src}
              width="100%"
              height={152}
              frameBorder="0"
              allowFullScreen
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="mb-2"
              title={episode.title}
            />
            <span className="text-gray-500">{episode.description}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
