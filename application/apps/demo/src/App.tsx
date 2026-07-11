import { useState } from 'react';
import './App.css';
import Counter from './Counter';
import RecorderOverlay from './RecorderOverlay';

const App = () => {
  const [recordedRoot, setRecordedRoot] = useState<HTMLElement | null>(null);
  const [replayRoot, setReplayRoot] = useState<HTMLElement | null>(null);

  return (
    <div className="content">
      <h1>React Time Machine — demo</h1>
      <p>Recorder attaches to the left panel; the right panel is the replayed recording.</p>
      <div className="panes">
        <section>
          <h2>recorded</h2>
          <div ref={setRecordedRoot}>
            <Counter />
          </div>
        </section>
        <section>
          <h2>replayed</h2>
          <div ref={setReplayRoot} />
        </section>
      </div>
      <RecorderOverlay recordedRoot={recordedRoot} replayRoot={replayRoot} />
    </div>
  );
};

export default App;
