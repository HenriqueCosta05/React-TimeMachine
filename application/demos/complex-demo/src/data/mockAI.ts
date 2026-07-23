import type { ChatMessage, Conversation } from '../@types/chat';

const REPLY_TEMPLATES = [
  "Here's one way to think about \"{topic}\": break it into smaller pieces and tackle the riskiest part first.",
  "Good question about {topic}. The short answer is it depends on your constraints, but a solid default is to start simple and iterate.",
  "I looked into {topic} — the key tradeoff is speed versus correctness, and most teams lean toward correctness first.",
  "On {topic}: I'd suggest writing a quick spike, measuring, then deciding rather than guessing upfront.",
  "That's a common pain point with {topic}. A minimal fix usually beats a big rewrite here.",
];

const FALLBACK_REPLY = "I don't have enough context yet — could you say a bit more?";

function topicFromPrompt(prompt: string): string {
  const words = prompt.trim().split(/\s+/).slice(0, 6).join(' ');
  return words || 'that';
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/** Deterministic-ish canned reply so replays/recordings stay reproducible. */
export function generateMockReply(prompt: string): string {
  const trimmed = prompt.trim();
  if (!trimmed) return FALLBACK_REPLY;
  const template = REPLY_TEMPLATES[hashString(trimmed) % REPLY_TEMPLATES.length];
  return template.replace('{topic}', topicFromPrompt(trimmed));
}

function createMessage(role: ChatMessage['role'], content: string, createdAt: number): ChatMessage {
  return { id: crypto.randomUUID(), role, content, createdAt };
}

export function createSeedConversations(): Conversation[] {
  const now = Date.now();
  return [
    {
      id: crypto.randomUUID(),
      title: 'Refactoring the auth flow',
      createdAt: now - 1000 * 60 * 60 * 24,
      updatedAt: now - 1000 * 60 * 55,
      messages: [
        createMessage('user', 'What is the cleanest way to refactor our auth middleware?', now - 1000 * 60 * 60),
        createMessage(
          'assistant',
          generateMockReply('What is the cleanest way to refactor our auth middleware?'),
          now - 1000 * 60 * 58,
        ),
        createMessage('user', 'Should we do it incrementally or all at once?', now - 1000 * 60 * 56),
        createMessage(
          'assistant',
          generateMockReply('Should we do it incrementally or all at once?'),
          now - 1000 * 60 * 55,
        ),
      ],
    },
    {
      id: crypto.randomUUID(),
      title: 'New conversation',
      createdAt: now - 1000 * 60 * 5,
      updatedAt: now - 1000 * 60 * 5,
      messages: [],
    },
  ];
}
