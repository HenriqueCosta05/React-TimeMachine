# complex-demo

Mock chat app (conversations list, streaming-style mock AI replies, message
editing/regeneration) used to dogfood `@henriquecosta/react-debugmachine-devtools`
against a busier, more realistic component tree than `apps/demo`.

Wraps the chat UI (`src/views/Chat/`) in `<TimeMachineDevtools root={recordedRoot} />`
— see [src/App.tsx](src/App.tsx). Open the floating toggle (bottom-right) to
record, reproduce a bug, stop, then scrub the timeline and inspect state/DOM
diffs per interaction.

## Setup

```bash
pnpm install
```

## Get started

Start the dev server, and the app will be available at [http://localhost:3000](http://localhost:3000).

```bash
pnpm run dev
```

Build the app for production:

```bash
pnpm run build
```

Preview the production build locally:

```bash
pnpm run preview
```

## Structure

```
src/
  data/mockAI.ts               deterministic-ish canned replies (hash of the prompt), seed conversations
  hooks/useChatStore.ts        conversation state, send/edit/regenerate, fake reply latency
  components/ConversationList/ sidebar: switch/create conversations
  components/ChatInput/        message composer
  components/Message/          message bubble, inline edit-and-regenerate
  views/Chat/                  wires the above into the chat screen
  App.tsx                       mounts Chat + TimeMachineDevtools against the same root
```

## Learn more

To learn more about Rsbuild, check out the following resources:

- [Rsbuild documentation](https://rsbuild.rs) - explore Rsbuild features and APIs.
- [Rsbuild GitHub repository](https://github.com/web-infra-dev/rsbuild) - your feedback and contributions are welcome!
