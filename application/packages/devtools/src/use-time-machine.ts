import { useCallback, useRef, useState } from "react";
import { Recorder } from "@henriquecosta/react-debugmachine-recorder";
import { Player } from "@henriquecosta/react-debugmachine-player";
import type { TimeMachineEvent } from "@henriquecosta/react-debugmachine-shared";

export type TimeMachineState = "idle" | "recording" | "stopped";

export interface UseTimeMachineOptions {
  /** DOM node to record. `start()` is a no-op until this is non-null. */
  root: HTMLElement | null;
}

export interface UseTimeMachineResult {
  state: TimeMachineState;
  eventCount: number;
  durationMs: number;
  scrubMs: number;
  /** Full event log from the last stopped recording, in capture order. Empty until `stop()`. */
  events: TimeMachineEvent[];
  start: () => void;
  stop: () => void;
  seek: (timestampMs: number) => void;
  /** Ref callback: attach to whichever element should render the replay. */
  replayRef: (element: HTMLElement | null) => void;
}

/** Reusable recorder/player wiring, decoupled from any particular UI —
 * powers `TimeMachineDevtools`'s built-in panel, and is the primitive to
 * reach for when building a fully custom debug UI instead. */
export function useTimeMachine(options: UseTimeMachineOptions): UseTimeMachineResult {
  const [state, setState] = useState<TimeMachineState>("idle");
  const [eventCount, setEventCount] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [scrubMs, setScrubMs] = useState(0);
  const [events, setEvents] = useState<TimeMachineEvent[]>([]);

  const recorderRef = useRef<Recorder | null>(null);
  const playerRef = useRef<Player | null>(null);
  const replayElementRef = useRef<HTMLElement | null>(null);
  const scrubMsRef = useRef(0);

  const replayRef = useCallback((element: HTMLElement | null) => {
    replayElementRef.current = element;
    if (element && playerRef.current) {
      playerRef.current.seekTo(element, scrubMsRef.current);
    }
  }, []);

  const start = useCallback(() => {
    if (!options.root) return;
    recorderRef.current = new Recorder({ root: options.root });
    recorderRef.current.start();
    playerRef.current = null;
    setState("recording");
    setEventCount(0);
    setDurationMs(0);
    setScrubMs(0);
    setEvents([]);
    scrubMsRef.current = 0;
  }, [options.root]);

  const stop = useCallback(() => {
    if (!recorderRef.current) return;
    const recording = recorderRef.current.stop();
    const player = new Player(recording);
    playerRef.current = player;
    setEventCount(recording.events.length);
    setEvents(recording.events);
    setDurationMs(player.durationMs);
    setScrubMs(player.durationMs);
    scrubMsRef.current = player.durationMs;
    setState("stopped");
    if (replayElementRef.current) {
      player.seekTo(replayElementRef.current, player.durationMs);
    }
  }, []);

  const seek = useCallback((timestampMs: number) => {
    if (!playerRef.current || !replayElementRef.current) return;
    setScrubMs(timestampMs);
    scrubMsRef.current = timestampMs;
    playerRef.current.seekTo(replayElementRef.current, timestampMs);
  }, []);

  return { state, eventCount, durationMs, scrubMs, events, start, stop, seek, replayRef };
}
