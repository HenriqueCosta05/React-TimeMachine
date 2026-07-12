import type { StateDiffPayload } from "@henriquecosta/react-debugmachine-shared";
import type { RecordingClock } from "./clock";
import type { Fiber, FiberRoot, HookNode, ReactDevToolsGlobalHook } from "./fiber-types";

/** Fiber `tag` values that represent a component instance (as opposed to a host DOM
 * node, text node, root, etc). See react-reconciler's `ReactWorkTags`. */
const COMPONENT_TAGS = new Set([
  0, // FunctionComponent
  1, // ClassComponent
  2, // IndeterminateComponent
  11, // ForwardRef
  14, // MemoComponent
  15, // SimpleMemoComponent
]);

let nextComponentId = 1;
const componentIds = new WeakMap<Fiber, string>();

function getComponentId(fiber: Fiber): string {
  const existing = componentIds.get(fiber);
  if (existing) return existing;

  const alternateId = fiber.alternate ? componentIds.get(fiber.alternate) : undefined;
  const id = alternateId ?? `c${nextComponentId++}`;
  componentIds.set(fiber, id);
  if (fiber.alternate) componentIds.set(fiber.alternate, id);
  return id;
}

function getComponentName(fiber: Fiber): string {
  const type = fiber.type;
  if (typeof type === "string") return type;
  if (typeof type === "function") {
    const named = type as { displayName?: string; name?: string };
    return named.displayName ?? named.name ?? "Anonymous";
  }
  return "Anonymous";
}

function diffShallow(
  prev: Record<string, unknown> | null,
  next: Record<string, unknown> | null,
): Record<string, unknown> {
  if (!next) return {};
  const changed: Record<string, unknown> = {};
  for (const key of Object.keys(next)) {
    if (!prev || !Object.is(prev[key], next[key])) {
      changed[key] = next[key];
    }
  }
  return changed;
}

/** Function components store hook state as a linked list, not a plain object.
 * Flatten it to `{ "0": value, "1": value, ... }` by hook order so it diffs like
 * any other state bag. */
function flattenHookState(memoizedState: HookNode | Record<string, unknown> | null): Record<string, unknown> {
  if (!memoizedState || typeof memoizedState !== "object") return {};
  if (!("next" in memoizedState)) return memoizedState as Record<string, unknown>;

  const flattened: Record<string, unknown> = {};
  let hook: HookNode | null = memoizedState as HookNode;
  let index = 0;
  while (hook) {
    flattened[String(index)] = hook.memoizedState;
    hook = hook.next;
    index += 1;
  }
  return flattened;
}

function visitFiber(fiber: Fiber, clock: RecordingClock, emit: (payload: StateDiffPayload) => void): void {
  if (COMPONENT_TAGS.has(fiber.tag)) {
    const prevProps = fiber.alternate?.memoizedProps ?? null;
    const prevState = fiber.alternate ? flattenHookState(fiber.alternate.memoizedState) : null;
    const changedProps = diffShallow(prevProps, fiber.memoizedProps);
    const changedState = diffShallow(prevState, flattenHookState(fiber.memoizedState));

    if (Object.keys(changedProps).length > 0 || Object.keys(changedState).length > 0) {
      emit({
        componentId: getComponentId(fiber),
        componentName: getComponentName(fiber),
        changedProps,
        changedState,
      });
    }
  }

  if (fiber.child) visitFiber(fiber.child, clock, emit);
  if (fiber.sibling) visitFiber(fiber.sibling, clock, emit);
}

export interface FiberHookOptions {
  clock: RecordingClock;
  onStateDiff: (payload: StateDiffPayload, timestamp: number) => void;
}

/** Taps React's commit phase via the same global hook the React DevTools extension
 * uses, so it works regardless of which state library (if any) the app uses.
 *
 * Must run before React attaches to the page (before the first `createRoot`/
 * `render` call) — React only registers a renderer with whatever hook object
 * is at `window.__REACT_DEVTOOLS_GLOBAL_HOOK__` at that moment. */
let nextRendererId = 1;

export function installFiberHook(options: FiberHookOptions): () => void {
  const hook: ReactDevToolsGlobalHook = (window.__REACT_DEVTOOLS_GLOBAL_HOOK__ ??= {
    supportsFiber: true,
  });

  // React only calls `onCommitFiberRoot` once `inject()` has succeeded — a real
  // DevTools extension provides one, but without it React's injection throws
  // and silently no-ops. Provide a no-op renderer ID so injection succeeds.
  hook.inject ??= () => nextRendererId++;

  const previousOnCommitFiberRoot = hook.onCommitFiberRoot;

  hook.onCommitFiberRoot = (rendererID: number, root: FiberRoot, priority?: unknown) => {
    visitFiber(root.current, options.clock, (payload) => {
      options.onStateDiff(payload, options.clock.elapsed());
    });
    previousOnCommitFiberRoot?.(rendererID, root, priority);
  };

  return () => {
    hook.onCommitFiberRoot = previousOnCommitFiberRoot;
  };
}
