import { useState } from 'react';
import type { ChatMessage } from '../../@types/chat';
import './Message.css';

export interface MessageProps {
  message: ChatMessage;
  /** Present only for messages the user is allowed to edit (their own). */
  onEdit?: (content: string) => void;
}

const Message = ({ message, onEdit }: MessageProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(message.content);

  const startEdit = () => {
    setDraft(message.content);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setDraft(message.content);
    setIsEditing(false);
  };

  const saveEdit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== message.content) onEdit?.(trimmed);
    setIsEditing(false);
  };

  return (
    <div className={`msg msg-${message.role}`}>
      <span className="msg-role">{message.role === 'user' ? 'you' : 'assistant'}</span>
      <div className="msg-bubble">
        {isEditing ? (
          <div className="msg-edit">
            <textarea
              className="msg-edit-textarea"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              autoFocus
              rows={3}
            />
            <div className="msg-edit-actions">
              <button type="button" className="msg-btn msg-btn-primary" onClick={saveEdit}>
                save &amp; regenerate
              </button>
              <button type="button" className="msg-btn" onClick={cancelEdit}>
                cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="msg-content">{message.content}</p>
            <div className="msg-meta">
              {message.editedAt ? <span className="msg-edited">edited</span> : null}
              {onEdit ? (
                <button type="button" className="msg-edit-trigger" onClick={startEdit}>
                  edit
                </button>
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Message;
