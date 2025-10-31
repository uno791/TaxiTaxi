import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import {
  DEFAULT_MUSIC_TRACK_ID,
  DEFAULT_PLAYLIST,
  MUSIC_TRACKS,
  type MusicTrackConfig,
  type MusicTrackId,
} from "../constants/music";

type ActiveTrackState = {
  id: MusicTrackId;
  priority: number;
};

const VOLUME_STORAGE_KEY = "taxiTaxiMusicVolume";

type MusicContextValue = {
  currentTrackId: MusicTrackId;
  currentTrack: MusicTrackConfig;
  isMuted: boolean;
  setMuted: (muted: boolean) => void;
  toggleMuted: () => void;
  volume: number;
  setVolume: (value: number) => void;
  requestTrack: (id: MusicTrackId, priorityOverride?: number) => void;
  releaseTrack: (id: MusicTrackId) => void;
  availableTracks: MusicTrackConfig[];
  isSuppressed: boolean;
  suppressPlayback: () => void;
  releasePlayback: () => void;
};

const MusicContext = createContext<MusicContextValue | undefined>(undefined);

export function MusicProvider({ children }: { children: ReactNode }) {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolumeState] = useState(() => {
    if (typeof window === "undefined") return 1;
    const stored = window.localStorage.getItem(VOLUME_STORAGE_KEY);
    if (!stored) return 1;
    const parsed = Number.parseFloat(stored);
    if (!Number.isFinite(parsed)) return 1;
    return Math.min(Math.max(parsed, 0), 1);
  });
  const [activeTrack, setActiveTrack] = useState<ActiveTrackState>({
    id: DEFAULT_MUSIC_TRACK_ID,
    priority: MUSIC_TRACKS[DEFAULT_MUSIC_TRACK_ID].priority,
  });

  const baseTrackIdRef = useRef<MusicTrackId>(DEFAULT_MUSIC_TRACK_ID);
  const overridesRef = useRef<Map<MusicTrackId, number>>(new Map());
  const audioMapRef = useRef<
    Partial<Record<MusicTrackId, HTMLAudioElement>>
  >({});
  const readyRef = useRef(false);
  const previousTrackIdRef = useRef<MusicTrackId>(DEFAULT_MUSIC_TRACK_ID);
  const hasInteractedRef = useRef(false);
  const activeTrackIdRef = useRef<MusicTrackId>(DEFAULT_MUSIC_TRACK_ID);
  const isMutedRef = useRef(isMuted);
  const volumeRef = useRef(volume);
  const suppressionCountRef = useRef(0);
  const suppressedRef = useRef(false);
  const [isSuppressedState, setIsSuppressedState] = useState(false);

  const availableTracks = useMemo(
    () => Object.values(MUSIC_TRACKS),
    []
  );

  const setVolume = useCallback((nextVolume: number) => {
    const clamped = Number.isFinite(nextVolume)
      ? Math.min(Math.max(nextVolume, 0), 1)
      : volumeRef.current;
    setVolumeState(clamped);
  }, []);

  const evaluateTrack = useCallback(() => {
    setActiveTrack((previous) => {
      let selectedId = baseTrackIdRef.current;
      if (!MUSIC_TRACKS[selectedId]) {
        selectedId = DEFAULT_MUSIC_TRACK_ID;
        baseTrackIdRef.current = selectedId;
      }
      let highestPriority = MUSIC_TRACKS[selectedId].priority;

      overridesRef.current.forEach((priority, trackId) => {
        if (priority > highestPriority) {
          highestPriority = priority;
          selectedId = trackId;
        }
      });

      if (
        previous.id === selectedId &&
        previous.priority === highestPriority
      ) {
        return previous;
      }

      return { id: selectedId, priority: highestPriority };
    });
  }, []);

  const advanceBasePlaylist = useCallback(() => {
    if (DEFAULT_PLAYLIST.length === 0) return;

    const currentId = baseTrackIdRef.current;
    const currentIndex = DEFAULT_PLAYLIST.indexOf(currentId);
    const nextIndex =
      currentIndex === -1
        ? 0
        : (currentIndex + 1) % DEFAULT_PLAYLIST.length;
    const nextId = DEFAULT_PLAYLIST[nextIndex];

    if (baseTrackIdRef.current === nextId) return;
    baseTrackIdRef.current = nextId;
    evaluateTrack();
  }, [evaluateTrack]);

  const requestTrack = useCallback(
    (id: MusicTrackId, priorityOverride?: number) => {
      if (!MUSIC_TRACKS[id]) {
        console.warn(`Unknown music track requested: ${id}`);
        return;
      }

      if (id === DEFAULT_MUSIC_TRACK_ID) {
        overridesRef.current.delete(id);
        evaluateTrack();
        return;
      }

      const priority =
        priorityOverride ?? MUSIC_TRACKS[id].priority ?? 0;
      overridesRef.current.set(id, priority);
      evaluateTrack();
    },
    [evaluateTrack]
  );

  const releaseTrack = useCallback(
    (id: MusicTrackId) => {
      if (!overridesRef.current.has(id)) return;
      overridesRef.current.delete(id);
      evaluateTrack();
    },
    [evaluateTrack]
  );

  useEffect(() => {
    if (typeof Audio === "undefined") return undefined;

    const playlistSet = new Set<MusicTrackId>(DEFAULT_PLAYLIST);
    const playlistListeners: Array<{
      audio: HTMLAudioElement;
      handler: () => void;
    }> = [];

    const audioEntries = Object.entries(MUSIC_TRACKS).map(
      ([trackKey, config]) => {
        const trackId = trackKey as MusicTrackId;
        const audio = new Audio(config.src);
        audio.loop = Boolean(config.loop);
        audio.preload = "auto";
        const baseVolume = config.volume ?? 0.6;
        audio.volume = baseVolume * volumeRef.current;
        audio.muted = false;

        if (playlistSet.has(trackId)) {
          const handleEnded = () => {
            if (overridesRef.current.size > 0) return;
            if (activeTrackIdRef.current !== trackId) return;
            if (baseTrackIdRef.current !== trackId) return;
            advanceBasePlaylist();
          };
          audio.addEventListener("ended", handleEnded);
          playlistListeners.push({ audio, handler: handleEnded });
        }

        return [trackId, audio] as const;
      }
    );

    audioEntries.forEach(([trackId, audio]) => {
      audioMapRef.current[trackId] = audio;
    });

    readyRef.current = true;

    if (hasInteractedRef.current && !isMutedRef.current && !suppressedRef.current) {
      const currentAudio = audioMapRef.current[activeTrackIdRef.current];
      if (currentAudio) {
        const playPromise = currentAudio.play();
        if (playPromise) {
          void playPromise.catch(() => undefined);
        }
      }
    }

    return () => {
      playlistListeners.forEach(({ audio, handler }) => {
        audio.removeEventListener("ended", handler);
      });
      audioEntries.forEach(([trackId, audio]) => {
        audio.pause();
        delete audioMapRef.current[trackId];
      });
      readyRef.current = false;
      audioMapRef.current = {};
    };
  }, [advanceBasePlaylist]);

  useEffect(() => {
    if (!readyRef.current) return;
    const audios = audioMapRef.current;

    Object.values(audios).forEach((audio) => {
      if (!audio) return;
      audio.muted = isMuted || isSuppressedState;
    });

    if (!isMuted && !isSuppressedState && hasInteractedRef.current) {
      const currentAudio = audios[activeTrackIdRef.current];
      if (currentAudio && currentAudio.paused) {
        const playPromise = currentAudio.play();
        if (playPromise) {
          void playPromise.catch(() => undefined);
        }
      }
    }
  }, [isMuted, isSuppressedState]);

  useEffect(() => {
    activeTrackIdRef.current = activeTrack.id;
  }, [activeTrack.id]);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    suppressedRef.current = isSuppressedState;
  }, [isSuppressedState]);

  useEffect(() => {
    volumeRef.current = volume;
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        VOLUME_STORAGE_KEY,
        volume.toString()
      );
    }

    const audios = audioMapRef.current;
    Object.entries(audios).forEach(([trackId, audio]) => {
      if (!audio) return;
      const config = MUSIC_TRACKS[trackId as MusicTrackId];
      const baseVolume = config?.volume ?? 0.6;
      audio.volume = baseVolume * volume;
    });
  }, [volume]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const handleInteraction = () => {
      if (hasInteractedRef.current) return;
      hasInteractedRef.current = true;
      removeListeners();

      if (isMutedRef.current || suppressedRef.current) return;

      const audio = audioMapRef.current[activeTrackIdRef.current];
      if (!audio) return;

      const playPromise = audio.play();
      if (playPromise) {
        void playPromise.catch(() => undefined);
      }
    };

    function removeListeners() {
      window.removeEventListener("pointerdown", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
    }

    window.addEventListener("pointerdown", handleInteraction);
    window.addEventListener("keydown", handleInteraction);
    window.addEventListener("touchstart", handleInteraction);

    return () => {
      removeListeners();
    };
  }, []);

  useEffect(() => {
    if (!readyRef.current) return;
    const audios = audioMapRef.current;
    const currentId = activeTrack.id;
    const currentConfig = MUSIC_TRACKS[currentId];
    const currentAudio = audios[currentId];

    if (!currentAudio) return;

    currentAudio.loop = Boolean(currentConfig.loop);
    const baseVolume = currentConfig.volume ?? 0.6;
    currentAudio.volume = baseVolume * volumeRef.current;

    Object.entries(audios).forEach(([trackId, audio]) => {
      if (!audio || (trackId as MusicTrackId) === currentId) return;
      audio.pause();
      audio.currentTime = 0;
    });

    if (previousTrackIdRef.current !== currentId) {
      const previousAudio = audios[previousTrackIdRef.current];
      if (previousAudio) {
        previousAudio.pause();
        previousAudio.currentTime = 0;
      }
      currentAudio.currentTime = 0;
    }

    if (!isMuted && !suppressedRef.current && hasInteractedRef.current) {
      const playPromise = currentAudio.play();
      if (playPromise) {
        void playPromise.catch(() => undefined);
      }
    }

    previousTrackIdRef.current = currentId;
  }, [activeTrack.id, isMuted]);

  const toggleMuted = useCallback(() => {
    setIsMuted((previous) => !previous);
  }, []);

  const updateSuppressedState = useCallback(() => {
    const suppressed = suppressionCountRef.current > 0;
    if (suppressedRef.current !== suppressed) {
      suppressedRef.current = suppressed;
      setIsSuppressedState(suppressed);
    }
  }, []);

  const suppressPlayback = useCallback(() => {
    suppressionCountRef.current += 1;
    updateSuppressedState();
  }, [updateSuppressedState]);

  const releasePlayback = useCallback(() => {
    if (suppressionCountRef.current === 0) return;
    suppressionCountRef.current -= 1;
    updateSuppressedState();
  }, [updateSuppressedState]);

  const contextValue = useMemo<MusicContextValue>(
    () => ({
      currentTrackId: activeTrack.id,
      currentTrack: MUSIC_TRACKS[activeTrack.id],
      isMuted,
      setMuted: setIsMuted,
      toggleMuted,
      volume,
      setVolume,
      requestTrack,
      releaseTrack,
      availableTracks,
      isSuppressed: isSuppressedState,
      suppressPlayback,
      releasePlayback,
    }),
    [
      activeTrack.id,
      availableTracks,
      isMuted,
      releaseTrack,
      requestTrack,
      toggleMuted,
      volume,
      setVolume,
      isSuppressedState,
      suppressPlayback,
      releasePlayback,
    ]
  );

  return (
    <MusicContext.Provider value={contextValue}>
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error("useMusic must be used within MusicProvider");
  return ctx;
}
