export interface Episode {
  id: string;
  title: string;
  topics?: string[];
  description: string;
  link: string;
  audioUrl: string;
  embedSrc?: string;
  durationSeconds: number;
  publishedAt: string;
}
