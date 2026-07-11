/** Structural subset of React's internal Fiber node — just what the recorder reads.
 * Not imported from `react-reconciler` because its types track the internal build,
 * not the public API, and drift across React versions. */
export interface Fiber {
  tag: number;
  type: unknown;
  key: string | null;
  memoizedProps: Record<string, unknown> | null;
  memoizedState: HookNode | Record<string, unknown> | null;
  child: Fiber | null;
  sibling: Fiber | null;
  return: Fiber | null;
  alternate: Fiber | null;
  stateNode: unknown;
}

/** One node in a function component's hooks linked list (`useState`/`useReducer` etc). */
export interface HookNode {
  memoizedState: unknown;
  next: HookNode | null;
}

export interface FiberRoot {
  current: Fiber;
}

export interface ReactDevToolsGlobalHook {
  onCommitFiberRoot?: ((rendererID: number, root: FiberRoot, priority?: unknown) => void) | undefined;
  inject?: ((renderer: unknown) => number) | undefined;
  supportsFiber?: boolean;
  [key: string]: unknown;
}

declare global {
  interface Window {
    __REACT_DEVTOOLS_GLOBAL_HOOK__?: ReactDevToolsGlobalHook;
  }
}
