declare global {
  interface Window {
    __REACT_DEVTOOLS_GLOBAL_HOOK__?: {
      supportsFiber?: boolean;
      inject?: (renderer: unknown) => number;
      onCommitFiberRoot?: unknown;
      [key: string]: unknown;
    };
  }
}

// Must be imported before `react-dom/client` anywhere in the bundle — React
// only registers a renderer with whatever hook object already sits at
// `window.__REACT_DEVTOOLS_GLOBAL_HOOK__` when its module first evaluates.
// This just makes sure that slot exists; `Recorder.start()` attaches the real
// `onCommitFiberRoot` handler later, once the app has mounted.
if (typeof window !== "undefined" && !window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
    supportsFiber: true,
    inject: () => 1,
  };
}

export {};
