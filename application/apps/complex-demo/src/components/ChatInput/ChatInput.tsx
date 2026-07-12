import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import './ChatInput.css';

export interface ChatInputProps {
  disabled?: boolean;
  onSend: (content: string) => void;
}

const ChatInput = ({ disabled, onSend }: ChatInputProps) => {
  const [value, setValue] = useState('');

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <div className="chat-input">
      <textarea
        className="chat-input-textarea"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Message the assistant…"
        rows={1}
      />
      <button
        type="button"
        className="chat-input-send"
        onClick={submit}
        disabled={disabled || !value.trim()}
      >
        send
      </button>
    </div>
  );
};

export default ChatInput;
