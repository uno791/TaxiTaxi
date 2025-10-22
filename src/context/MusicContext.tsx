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
  MUSIC_TRACKS,
  type MusicTrackConfig,
  type MusicTrackId,
} from "../constants/music";

type ActiveTrackState = {
  id: MusicTrackId;
  priority: number;
};

type MusicContextValue = {
  currentTrackId: MusicTrackId;
  currentTrack: MusicTrackConfig;
  isMuted: boolean;
  setMuted: (muted: boolean) => void;
  toggleMuted: () => void;
  requestTrack: (id: MusicTrackId, priorityOverride?: number) => void;
  releaseTrack: (id: MusicTrackId) => void;
  availableTracks: MusicTrackConfig[];
};

const MusicContext = createContext<MusicContextValue | undefined>(undefined);

export function MusicProvider({ children }: { children: ReactNode }) {
  const [isMuted, setIsMuted] = useState(false);
  const [activeTrack, setActiveTrack] = useState<ActiveTrackState>({
    id: DEFAULT_MUSIC_TRACK_ID,
    priority: MUSIC_TRACKS[DEFAULT_MUSIC_TRACK_ID].priority,
  });

  const overridesRef = useRef<Map<MusicTrackId, number>>(new Map());
  const audioMapRef = useRef<
    Partial<Record<MusicTrackId, HTMLAudioElement>>
  >({});
  const readyRef = useRef(false);
  const previousTrackIdRef = useRef<MusicTrackId>(DEFAULT_MUSIC_TRACK_ID);
  const hasInteractedRef = useRef(false);
  const activeTrackIdRef = useRef<MusicTrackId>(DEFAULT_MUSIC_TRACK_ID);
  const isMutedRef = useRef(isMuted);

  const availableTracks = useMemo(
    () => Object.values(MUSIC_TRACKS),
    []
  );

  const evaluateTrack = useCallback(() => {
    setActiveTrack((previous) => {
      let selectedId: MusicTrackId = DEFAULT_MUSIC_TRACK_ID;
      let highestPriority = MUSIC_TRACKS[DEFAULT_MUSIC_TRACK_ID].priority;

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

    const audioEntries = Object.entries(MUSIC_TRACKS).map(
      ([trackId, config]) => {
        const audio = new Audio(config.src);
        audio.loop = Boolean(config.loop);
        audio.preload = "auto";
        audio.volume = config.volume ?? 0.6;
        audio.muted = false;
        return [trackId as MusicTrackId, audio] as const;
      }
    );

    audioEntries.forEach(([trackId, audio]) => {
      audioMapRef.current[trackId] = audio;
    });

    readyRef.current = true;

    if (hasInteractedRef.current && !isMutedRef.current) {
      const currentAudio = audioMapRef.current[activeTrackIdRef.current];
      if (currentAudio) {
        const playPromise = currentAudio.play();
        if (playPromise) {
          void playPromise.catch(() => undefined);
        }
      }
    }

    return () => {
      audioEntries.forEach(([, audio]) => {
        audio.pause();
      });
      readyRef.current = false;
      audioMapRef.current = {};
    };
  }, []);

  useEffect(() => {
    if (!readyRef.current) return;
    const audios = audioMapRef.current;

    Object.values(audios).forEach((audio) => {
      if (!audio) return;
      audio.muted = isMuted;
    });

    if (!isMuted && hasInteractedRef.current) {
      const currentAudio = audios[activeTrackIdRef.current];
      if (currentAudio && currentAudio.paused) {
        const playPromise = currentAudio.play();
        if (playPromise) {
          void playPromise.catch(() => undefined);
        }
      }
    }
  }, [isMuted]);

  useEffect(() => {
    activeTrackIdRef.current = activeTrack.id;
  }, [activeTrack.id]);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const handleInteraction = () => {
      if (hasInteractedRef.current) return;
      hasInteractedRef.current = true;
      removeListeners();

      if (isMutedRef.current) return;

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
    currentAudio.volume = currentConfig.volume ?? 0.6;

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

    if (!isMuted && hasInteractedRef.current) {
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

  const contextValue = useMemo<MusicContextValue>(
    () => ({
      currentTrackId: activeTrack.id,
      currentTrack: MUSIC_TRACKS[activeTrack.id],
      isMuted,
      setMuted: setIsMuted,
      toggleMuted,
      requestTrack,
      releaseTrack,
      availableTracks,
    }),
    [activeTrack.id, availableTracks, isMuted, releaseTrack, requestTrack, toggleMuted]
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
