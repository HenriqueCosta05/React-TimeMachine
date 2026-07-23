import { useMemo } from 'react';
import type { Conversation } from '../../@types/chat';
import './ConversationList.css';

export interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
}

function previewOf(conversation: Conversation): string {
  const last = conversation.messages[conversation.messages.length - 1];
  return last ? last.content : 'No messages yet';
}

/** Index of every mock conversation, most recently active first. */
const ConversationList = ({
  conversations,
  activeConversationId,
  onSelect,
  onCreate,
}: ConversationListProps) => {
  const sorted = useMemo(
    () => [...conversations].sort((a, b) => b.updatedAt - a.updatedAt),
    [conversations],
  );

  return (
    <div className="conv-list">
      <div className="conv-list-header">
        <span className="conv-list-title">Conversations</span>
        <button type="button" className="conv-new-btn" onClick={onCreate}>
          + new
        </button>
      </div>
      <div className="conv-list-items">
        {sorted.map((conversation) => (
          <button
            type="button"
            key={conversation.id}
            className={`conv-item${
              conversation.id === activeConversationId ? ' conv-item-active' : ''
            }`}
            onClick={() => onSelect(conversation.id)}
          >
            <span className="conv-item-title">{conversation.title}</span>
            <span className="conv-item-preview">{previewOf(conversation)}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ConversationList;
