import { useEffect, useMemo, useRef } from 'react';
import ConversationList from '../../components/ConversationList/ConversationList';
import Message from '../../components/Message/Message';
import ChatInput from '../../components/ChatInput/ChatInput';
import { useChatStore } from '../../hooks/useChatStore';
import { createSeedConversations } from '../../data/mockAI';
import './Chat.css';

const Chat = () => {
  const initialConversations = useMemo(() => createSeedConversations(), []);
  const {
    conversations,
    activeConversation,
    activeConversationId,
    typingConversationId,
    selectConversation,
    createConversation,
    sendMessage,
    editMessage,
  } = useChatStore(initialConversations);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages.length, typingConversationId]);

  const isTyping = typingConversationId === activeConversationId;

  return (
    <div className="chat-app">
      <ConversationList
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelect={selectConversation}
        onCreate={createConversation}
      />
      <div className="chat-thread">
        {activeConversation ? (
          <>
            <div className="chat-thread-header">
              <span className="chat-thread-title">{activeConversation.title}</span>
            </div>
            <div className="chat-messages">
              {activeConversation.messages.map((message) => (
                <Message
                  key={message.id}
                  message={message}
                  onEdit={
                    message.role === 'user'
                      ? (content) => editMessage(activeConversation.id, message.id, content)
                      : undefined
                  }
                />
              ))}
              {isTyping ? (
                <div className="msg msg-assistant">
                  <span className="msg-role">assistant</span>
                  <div className="msg-bubble chat-typing">
                    <span className="chat-typing-dot" />
                    <span className="chat-typing-dot" />
                    <span className="chat-typing-dot" />
                  </div>
                </div>
              ) : null}
              <div ref={messagesEndRef} />
            </div>
            <ChatInput
              disabled={isTyping}
              onSend={(content) => sendMessage(activeConversation.id, content)}
            />
          </>
        ) : (
          <div className="chat-empty">Select or start a conversation</div>
        )}
      </div>
    </div>
  );
};

export default Chat;
