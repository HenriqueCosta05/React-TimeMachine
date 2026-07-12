import { useState } from 'react';
import { TimeMachineDevtools } from '@henriquecosta/react-debugmachine-devtools';
import Chat from './views/Chat/Chat';
import './App.css';

const App = () => {
  const [recordedRoot, setRecordedRoot] = useState<HTMLElement | null>(null);

  return (
    <div className="content">
      <div ref={setRecordedRoot} className="content-recorded">
        <Chat />
      </div>
      <TimeMachineDevtools root={recordedRoot} />
    </div>
  );
};

export default App;
