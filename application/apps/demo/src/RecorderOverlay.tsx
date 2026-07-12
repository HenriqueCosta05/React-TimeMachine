import { Recorder } from '@henriquecosta/react-debugmachine-recorder';
import { Player } from '@henriquecosta/react-debugmachine-player';
import { useRef, useState } from 'react';

type RecordingState = 'idle' | 'recording' | 'stopped';

interface RecorderOverlayProps {
  recordedRoot: HTMLElement | null;
  replayRoot: HTMLElement | null;
}

const RecorderOverlay = ({ recordedRoot, replayRoot }: RecorderOverlayProps) => {
  const [state, setState] = useState<RecordingState>('idle');
  const [eventCount, setEventCount] = useState(0);
  const recorderRef = useRef<Recorder | null>(null);

  const handleStart = () => {
    if (!recordedRoot) return;
    recorderRef.current = new Recorder({ root: recordedRoot });
    recorderRef.current.start();
    setState('recording');
  };

  const handleStop = () => {
    if (!recorderRef.current || !replayRoot) return;
    const recording = recorderRef.current.stop();
    setEventCount(recording.events.length);
    setState('stopped');

    const player = new Player(recording);
    player.seekTo(replayRoot, player.durationMs);
  };

  return (
    <div className="recorder-overlay">
      <span className={`recorder-dot recorder-dot--${state}`} />
      <span>{state}</span>
      {state !== 'recording' ? (
        <button type="button" onClick={handleStart}>
          record
        </button>
      ) : (
        <button type="button" onClick={handleStop}>
          stop
        </button>
      )}
      {state === 'stopped' && <span>{eventCount} events replayed →</span>}
    </div>
  );
};

export default RecorderOverlay;
