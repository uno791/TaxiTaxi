export type MusicTrackConfig = {
  id: string;
  label: string;
  src: string;
  loop?: boolean;
  priority: number;
  volume?: number;
};

const TRACKS = {
  defaultTheme: {
    id: "defaultTheme",
    label: "A Bad Dream",
    src: "/music/A%20Bad%20Dream.mp3",
    loop: true,
    priority: 0,
    volume: 0.25,
  },
} satisfies Record<string, MusicTrackConfig>;

export type MusicTrackId = keyof typeof TRACKS;

export const MUSIC_TRACKS: Record<MusicTrackId, MusicTrackConfig> = TRACKS;

export const DEFAULT_MUSIC_TRACK_ID: MusicTrackId = "defaultTheme";
