import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTimeMachine } from "./use-time-machine";
import type { TimeMachineEvent } from "@henriquecosta/react-debugmachine-shared";

export interface TimeMachineDevtoolsProps {
  /** Element being recorded. */
  root: HTMLElement | null;
  /**
   * Render the built-in floating toggle + panel (Next.js-dev-indicator
   * style). Set to `false` to render nothing here and build a custom debug
   * UI on top of `useTimeMachine` instead. Defaults to `true`.
   */
  builtInUI?: boolean;
}

const ROW_HEIGHT = 44;
const OVERSCAN = 4;

const colors = {
  bg: "#09090b",
  surface: "rgba(24, 24, 27, 0.9)",
  border: "rgba(255,255,255,0.08)",
  text: "#fafafa",
  muted: "#a1a1aa",
  blue: "#3b82f6",
  red: "#ef4444",
  shadow: "0 24px 80px rgba(0,0,0,.45), 0 8px 24px rgba(0,0,0,.25)",
};

const fontFamily = "Inter, system-ui, sans-serif";
const monoFontFamily = '"JetBrains Mono", SFMono-Regular, Consolas, monospace';

export const toggleStyle: CSSProperties = {
  position: "fixed",
  bottom: 20,
  right: 20,
  zIndex: 2147483647,

  width: 50,
  height: 50,

  borderRadius: 999,

  border: `1px solid ${colors.border}`,

  background: colors.surface,

  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",

  color: colors.text,

  display: "flex",
  alignItems: "center",
  justifyContent: "center",

  fontSize: 18,

  cursor: "pointer",

  transition: "all .18s ease",

  boxShadow: colors.shadow,
};

// Fills almost the entire viewport so the interactions list and JSON detail
// pane both have real room to breathe, rather than the cramped bottom-right
// popover the panel started as.
const cardStyle: CSSProperties = {
  position: "fixed",
  top: "4vh",
  left: "2vw",
  right: "2vw",
  bottom: "4vh",

  display: "flex",
  flexDirection: "column",

  background: colors.surface,

  backdropFilter: "blur(28px)",
  WebkitBackdropFilter: "blur(28px)",

  border: `1px solid ${colors.border}`,
  borderRadius: 18,

  boxShadow: colors.shadow,

  overflow: "hidden",

  color: colors.text,
  fontFamily,

  zIndex: 2147483646,
};

const headerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",

  padding: "20px 24px",

  borderBottom: `1px solid ${colors.border}`,
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: 18,
  fontWeight: 700,
};

const eyebrowStyle: CSSProperties = {
  marginTop: 4,
  color: colors.muted,
  fontSize: 12,
  letterSpacing: ".08em",
  textTransform: "uppercase",
};

const controlsStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const btnStyle: CSSProperties = {
  border: "none",
  borderRadius: 999,
  padding: "10px 18px",
  cursor: "pointer",
  transition: "all .18s ease",
  fontWeight: 600,
  fontSize: 13,
};

const btnPrimaryStyle: CSSProperties = { ...btnStyle, background: colors.blue, color: "#fff" };
const btnSecondaryStyle: CSSProperties = { ...btnStyle, background: colors.red, color: "#fff" };
const btnDisabledStyle: CSSProperties = { ...btnPrimaryStyle, opacity: 0.45, cursor: "not-allowed" };

const labelStyle: CSSProperties = {
  color: colors.muted,
  fontSize: 12,
  whiteSpace: "nowrap",
};

const panesStyle: CSSProperties = {
  flex: 1,
  display: "flex",
  overflow: "hidden",
};

const paneStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
};

const interactionsPaneStyle: CSSProperties = {
  ...paneStyle,
  width: 420,
  flexShrink: 0,
  borderRight: `1px solid ${colors.border}`,
};

const debugPaneStyle: CSSProperties = {
  ...paneStyle,
  flex: 1,
  padding: 20,
  gap: 18,
};

const paneTitleStyle: CSSProperties = {
  margin: 0,
  padding: "18px 20px",
  fontSize: 13,
  textTransform: "uppercase",
  letterSpacing: ".08em",
  color: colors.muted,
  borderBottom: `1px solid ${colors.border}`,
};

const listStyle: CSSProperties = {
  overflowY: "auto",
  position: "relative",
  flex: 1,
};

const rowBaseStyle: CSSProperties = {
  position: "absolute",
  left: 8,
  right: 8,
  display: "grid",
  gridTemplateColumns: "72px 1fr auto",
  alignItems: "center",
  gap: 12,
  padding: "0 14px",
  borderRadius: 12,
  border: "1px solid transparent",
  background: "transparent",
  color: "inherit",
  cursor: "pointer",
  transition: "all .18s ease",
};

const rowSelectedStyle: CSSProperties = {
  background: "rgba(59,130,246,.12)",
  borderColor: "rgba(59,130,246,.28)",
  boxShadow: "inset 3px 0 " + colors.blue,
};

const rowTagStyle: CSSProperties = {
  display: "inline-flex",
  justifyContent: "center",
  alignItems: "center",
  height: 24,
  borderRadius: 999,
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: ".08em",
  background: "rgba(255,255,255,.05)",
  color: colors.muted,
};

const rowLabelStyle: CSSProperties = {
  overflow: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
  fontSize: 13,
};

const rowTimeStyle: CSSProperties = {
  color: colors.muted,
  fontVariantNumeric: "tabular-nums",
  fontSize: 12,
};

const scrubberStyle: CSSProperties = {
  width: "100%",
  accentColor: colors.blue,
  cursor: "pointer",
};

const replayStyle: CSSProperties = {
  minHeight: 220,
  borderRadius: 14,
  border: `1px solid ${colors.border}`,
  background: "linear-gradient(rgba(255,255,255,.02), rgba(255,255,255,.01))",
  overflow: "auto",
};

const jsonStyle: CSSProperties = {
  overflow: "auto",
  margin: 0,
  padding: 16,
  borderRadius: 14,
  border: `1px solid ${colors.border}`,
  background: "#050505",
  fontSize: 12,
  lineHeight: 1.65,
  fontFamily: monoFontFamily,
  minHeight: 150,
};

function eventLabel(event: TimeMachineEvent): string {
  switch (event.type) {
    case "state-diff":
      return event.payload.componentName;
    case "dom-mutation":
      return event.payload.kind;
    case "network-request":
      return `${event.payload.method} ${event.payload.url}`;
    case "network-response":
      return `${event.payload.status}`;
    default:
      return "";
  }
}

function typeTag(type: TimeMachineEvent["type"]): string {
  switch (type) {
    case "state-diff":
      return "STATE";
    case "dom-mutation":
      return "DOM";
    case "network-request":
      return "REQ →";
    case "network-response":
      return "RES ←";
    default:
      return "";
  }
}

/** Recorded payloads can carry live React/DOM references (e.g. an effect
 * hook's `memoizedState`, whose `next` linked list is circular by design) —
 * drop repeat references instead of letting JSON.stringify throw. */
function safeStringify(value: unknown): string {
  const seen = new WeakSet<object>();
  return JSON.stringify(
    value,
    (_key, val) => {
      if (typeof val === "object" && val !== null) {
        if (seen.has(val)) return "[Circular]";
        seen.add(val);
      }
      return val;
    },
    2,
  );
}

/** Batteries-included debug UI: a Next.js-dev-indicator-style toggle fixed to
 * the bottom-right corner, closed by default — click to reveal a near-full-
 * screen panel with a virtualized interactions list, a timeline scrubber, a
 * live replay preview, and a JSON detail pane. Pass `builtInUI={false}` to
 * opt out of any rendering here and drive `useTimeMachine` directly from a
 * custom UI instead. */
export function TimeMachineDevtools({ root, builtInUI = true }: TimeMachineDevtoolsProps) {
  const [open, setOpen] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);
  const [listHeight, setListHeight] = useState(480);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const timeMachine = useTimeMachine({ root });
  const { events } = timeMachine;

  useEffect(() => {
    const node = listRef.current;
    if (!open || !node || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setListHeight(entry.contentRect.height);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [open]);

  const visible = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
    const end = Math.min(events.length, Math.ceil((scrollTop + listHeight) / ROW_HEIGHT) + OVERSCAN);
    return { start, end };
  }, [scrollTop, listHeight, events.length]);

  const selectedEvent = selectedIndex !== null ? events[selectedIndex] : null;

  const selectRow = (index: number) => {
    const event = events[index];
    if (!event) return;
    setSelectedIndex(index);
    timeMachine.seek(event.timestamp);
  };

  if (!builtInUI) return null;

  return (
    <>
      <button
        type="button"
        style={toggleStyle}
        onClick={() => setOpen((value) => !value)}
        aria-label="Toggle Time Machine devtools"
        title="Time Machine devtools"
      >
        ⏱
      </button>
      {open && (
        <div style={cardStyle}>
          <div style={headerStyle}>
            <div>
              <h2 style={titleStyle}>Time Machine</h2>
              <p style={eyebrowStyle}>session recorder &amp; debugger</p>
            </div>
            <div style={controlsStyle}>
              {timeMachine.state !== "recording" ? (
                <button
                  type="button"
                  style={root ? btnPrimaryStyle : btnDisabledStyle}
                  onClick={timeMachine.start}
                  disabled={!root}
                >
                  record
                </button>
              ) : (
                <button type="button" style={btnSecondaryStyle} onClick={timeMachine.stop}>
                  stop
                </button>
              )}
              <span style={labelStyle}>
                {timeMachine.state} · {timeMachine.eventCount} events
              </span>
            </div>
          </div>

          <div style={panesStyle}>
            <section style={interactionsPaneStyle}>
              <h3 style={paneTitleStyle}>Interactions</h3>
              <div
                ref={listRef}
                style={listStyle}
                onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
              >
                <div style={{ position: "relative", height: events.length * ROW_HEIGHT }}>
                  {events.slice(visible.start, visible.end).map((event, offset) => {
                    const index = visible.start + offset;
                    return (
                      <button
                        type="button"
                        key={index}
                        style={{
                          ...rowBaseStyle,
                          ...(index === selectedIndex ? rowSelectedStyle : null),
                          height: ROW_HEIGHT,
                          transform: `translateY(${index * ROW_HEIGHT}px)`,
                        }}
                        onClick={() => selectRow(index)}
                      >
                        <span style={rowTagStyle}>{typeTag(event.type)}</span>
                        <span style={rowLabelStyle}>{eventLabel(event)}</span>
                        <span style={rowTimeStyle}>{Math.round(event.timestamp)}ms</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            <section style={debugPaneStyle}>
              <h3 style={paneTitleStyle}>Debug</h3>
              {timeMachine.state === "stopped" ? (
                <>
                  <input
                    type="range"
                    style={scrubberStyle}
                    min={0}
                    max={timeMachine.durationMs}
                    value={timeMachine.scrubMs}
                    onChange={(event) => {
                      setSelectedIndex(null);
                      timeMachine.seek(Number(event.target.value));
                    }}
                    aria-label="Scrub recording timeline"
                  />
                  <p style={labelStyle}>
                    {Math.round(timeMachine.scrubMs)}ms / {Math.round(timeMachine.durationMs)}ms
                  </p>
                  <div ref={timeMachine.replayRef} style={replayStyle} />
                  <pre style={jsonStyle}>
                    {selectedEvent ? safeStringify(selectedEvent) : "select an interaction"}
                  </pre>
                </>
              ) : (
                <p style={labelStyle}>record, then stop, to inspect interactions</p>
              )}
            </section>
          </div>
        </div>
      )}
    </>
  );
}
