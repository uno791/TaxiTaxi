export type MusicTrackConfig = {
  id: string;
  label: string;
  src: string;
  loop?: boolean;
  priority: number;
  volume?: number;
};

const TRACKS = {
  fuwatto: {
    id: "fuwatto",
    label: "ふわっと",
    src: "music/%E3%81%B5%E3%82%8F%E3%81%A3%E3%81%A8.mp3",
    loop: false,
    priority: 0,
    volume: 0.28,
  },
  defaultTheme: {
    id: "defaultTheme",
    label: "A Bad Dream",
    src: "music/A%20Bad%20Dream.mp3",
    loop: false,
    priority: 0,
    volume: 0.25,
  },
} satisfies Record<string, MusicTrackConfig>;

export type MusicTrackId = keyof typeof TRACKS;

export const MUSIC_TRACKS: Record<MusicTrackId, MusicTrackConfig> = TRACKS;

export const DEFAULT_PLAYLIST: MusicTrackId[] = ["fuwatto", "defaultTheme"];

export const DEFAULT_MUSIC_TRACK_ID: MusicTrackId = DEFAULT_PLAYLIST[0];
