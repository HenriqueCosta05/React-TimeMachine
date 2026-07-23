import { useState } from 'react';
import './App.css';
import Counter from './Counter';
import { TimeMachineDevtools } from '@henriquecosta/react-debugmachine-devtools';

const App = () => {
  const [recordedRoot, setRecordedRoot] = useState<HTMLElement | null>(null);

  return (
    <div className="content">
      <h1>React Time Machine — demo</h1>
      <p>The bottom-right toggle is the reusable devtools plugin — click it to record and scrub.</p>
      <div className="panes">
        <section ref={setRecordedRoot}>
          <h2>recorded</h2>
          <Counter />
        </section>
      </div>
      <TimeMachineDevtools root={recordedRoot} />
    </div>
  );
};

export default App;
