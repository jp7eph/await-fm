import type { ReactNode } from "react";
import {
  AmazonMusicIcon,
  ApplePodcastsIcon,
  RssIcon,
  SpotifyIcon,
  XIcon,
  YouTubeIcon,
} from "./icons";

interface Link {
  label: string;
  href: string;
  className: string;
  icon: ReactNode;
}

const links: Link[] = [
  {
    label: "Spotify",
    href: "https://open.spotify.com/show/1EdEzpjF1NB27op0TF69t4",
    className:
      "flex items-center gap-2 px-4 py-4 text-white duration-150 bg-green-500 rounded-lg hover:bg-green-400 active:bg-green-500",
    icon: <SpotifyIcon />,
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@await_fm",
    className:
      "flex items-center gap-2 px-4 py-4 text-white duration-150 bg-red-600 rounded-lg hover:bg-red-500 active:bg-red-700",
    icon: <YouTubeIcon />,
  },
  {
    label: "Apple Podcasts",
    href: "https://podcasts.apple.com/jp/podcast/await-fm/id1839927506",
    className:
      "flex items-center gap-2 px-4 py-4 text-white duration-150 bg-violet-600 rounded-lg hover:bg-violet-500 active:bg-violet-700",
    icon: <ApplePodcastsIcon />,
  },
  {
    label: "Amazon Music",
    href: "https://music.amazon.co.jp/podcasts/686b235c-22b8-42f2-b8ad-af97f8d3f557/await-fm",
    className:
      "flex items-center gap-2 px-4 py-4 text-white duration-150 bg-cyan-500 rounded-lg hover:bg-cyan-400 active:bg-cyan-600",
    icon: <AmazonMusicIcon />,
  },
  {
    label: "RSS",
    href: "https://anchor.fm/s/1068bb738/podcast/rss",
    className:
      "flex items-center gap-2 px-4 py-4 text-white duration-150 bg-orange-600 rounded-lg hover:bg-orange-500 active:bg-orange-700",
    icon: <RssIcon />,
  },
  {
    label: "X",
    href: "https://x.com/fmAwait",
    className:
      "flex items-center gap-2 px-4 py-4 text-white duration-150 bg-gray-900 rounded-lg hover:bg-gray-800 active:bg-gray-700",
    icon: <XIcon />,
  },
];

export function PlatformLinks() {
  return (
    <>
      {links.map(({ label, href, className, icon }) => (
        <a key={href} href={href} aria-label={label} className={className}>
          {icon}
        </a>
      ))}
    </>
  );
}
