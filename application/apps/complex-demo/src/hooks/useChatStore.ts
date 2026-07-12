import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChatMessage, Conversation } from '../@types/chat';
import { generateMockReply } from '../data/mockAI';

const REPLY_DELAY_MS = 700;
const TITLE_MAX_LENGTH = 40;

function titleFromContent(content: string): string {
  const trimmed = content.trim();
  if (trimmed.length <= TITLE_MAX_LENGTH) return trimmed || 'New conversation';
  return `${trimmed.slice(0, TITLE_MAX_LENGTH)}…`;
}

function createMessage(role: ChatMessage['role'], content: string): ChatMessage {
  return { id: crypto.randomUUID(), role, content, createdAt: Date.now() };
}

export interface UseChatStoreResult {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  activeConversationId: string | null;
  typingConversationId: string | null;
  selectConversation: (id: string) => void;
  createConversation: () => void;
  sendMessage: (conversationId: string, content: string) => void;
  editMessage: (conversationId: string, messageId: string, content: string) => void;
}

/** Owns all chat state for the mock AI app: conversation index, active thread,
 * and the fake "assistant is replying" latency. Editing a user message
 * truncates everything after it and regenerates the assistant reply, mirroring
 * a real chat product's edit-and-resubmit behavior. */
export function useChatStore(initial: Conversation[]): UseChatStoreResult {
  const [conversations, setConversations] = useState<Conversation[]>(initial);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    initial[0]?.id ?? null,
  );
  const [typingConversationId, setTypingConversationId] = useState<string | null>(null);
  const replyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (replyTimeoutRef.current) clearTimeout(replyTimeoutRef.current);
    };
  }, []);

  const queueAssistantReply = useCallback((conversationId: string, prompt: string) => {
    setTypingConversationId(conversationId);
    if (replyTimeoutRef.current) clearTimeout(replyTimeoutRef.current);
    replyTimeoutRef.current = setTimeout(() => {
      const reply = createMessage('assistant', generateMockReply(prompt));
      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === conversationId
            ? {
                ...conversation,
                messages: [...conversation.messages, reply],
                updatedAt: reply.createdAt,
              }
            : conversation,
        ),
      );
      setTypingConversationId(null);
    }, REPLY_DELAY_MS);
  }, []);

  const selectConversation = useCallback((id: string) => {
    setActiveConversationId(id);
  }, []);

  const createConversation = useCallback(() => {
    const conversation: Conversation = {
      id: crypto.randomUUID(),
      title: 'New conversation',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setConversations((prev) => [conversation, ...prev]);
    setActiveConversationId(conversation.id);
  }, []);

  const sendMessage = useCallback(
    (conversationId: string, content: string) => {
      const trimmed = content.trim();
      if (!trimmed) return;
      const message = createMessage('user', trimmed);
      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === conversationId
            ? {
                ...conversation,
                title:
                  conversation.messages.length === 0
                    ? titleFromContent(trimmed)
                    : conversation.title,
                messages: [...conversation.messages, message],
                updatedAt: message.createdAt,
              }
            : conversation,
        ),
      );
      queueAssistantReply(conversationId, trimmed);
    },
    [queueAssistantReply],
  );

  const editMessage = useCallback(
    (conversationId: string, messageId: string, content: string) => {
      const trimmed = content.trim();
      if (!trimmed) return;
      let regeneratePrompt: string | null = null;
      setConversations((prev) =>
        prev.map((conversation) => {
          if (conversation.id !== conversationId) return conversation;
          const index = conversation.messages.findIndex((message) => message.id === messageId);
          if (index === -1) return conversation;
          const edited: ChatMessage = {
            ...conversation.messages[index],
            content: trimmed,
            editedAt: Date.now(),
          };
          const messages = [...conversation.messages.slice(0, index), edited];
          regeneratePrompt = trimmed;
          return {
            ...conversation,
            title: index === 0 ? titleFromContent(trimmed) : conversation.title,
            messages,
            updatedAt: edited.editedAt ?? edited.createdAt,
          };
        }),
      );
      if (regeneratePrompt) queueAssistantReply(conversationId, regeneratePrompt);
    },
    [queueAssistantReply],
  );

  const activeConversation =
    conversations.find((conversation) => conversation.id === activeConversationId) ?? null;

  return {
    conversations,
    activeConversation,
    activeConversationId,
    typingConversationId,
    selectConversation,
    createConversation,
    sendMessage,
    editMessage,
  };
}
