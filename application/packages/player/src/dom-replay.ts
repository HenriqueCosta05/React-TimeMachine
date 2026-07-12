import type { DomMutationPayload, DomSnapshot } from "@henriquecosta/react-debugmachine-shared";

function snapshotToNode(snapshot: DomSnapshot): Node {
  if (snapshot.kind === "text") return document.createTextNode(snapshot.text);

  const element = document.createElement(snapshot.tag);
  for (const [name, value] of Object.entries(snapshot.attributes)) {
    element.setAttribute(name, value);
  }
  for (const child of snapshot.children) {
    element.appendChild(snapshotToNode(child));
  }
  return element;
}

function resolveNode(root: Node, path: number[]): Node | null {
  let node: Node | null = root;
  for (const index of path) {
    node = node?.childNodes[index] ?? null;
    if (!node) return null;
  }
  return node;
}

/** Applies one captured DOM mutation to `root`. Always called in recording
 * order, starting from `root` seeded with the recording's `initialSnapshot` —
 * that ordering is what makes replay deterministic. */
export function applyMutation(root: Node, payload: DomMutationPayload): void {
  const target = resolveNode(root, payload.targetPath);
  if (!target) return;

  if (payload.kind === "attributes") {
    const element = target as Element;
    if (!payload.attributeName) return;
    if (payload.newValue == null) element.removeAttribute(payload.attributeName);
    else element.setAttribute(payload.attributeName, payload.newValue);
    return;
  }

  if (payload.kind === "characterData") {
    target.textContent = payload.newValue ?? "";
    return;
  }

  // childList: removals and inserts are applied positionally, anchored to
  // `previousSiblingIndex`, so prepends, middle-of-list inserts, and removals
  // land in the same place they did live. Both removal and insertion start
  // right after that anchor — nothing before it is touched by this mutation,
  // so the same index is valid before and after the removal step runs.
  const startIndex = (payload.previousSiblingIndex ?? -1) + 1;

  const removedNodes = payload.removedNodes ?? [];
  for (let i = 0; i < removedNodes.length; i++) {
    const child = target.childNodes[startIndex];
    if (child) target.removeChild(child);
  }

  const addedNodes = payload.addedNodes ?? [];
  const reference = target.childNodes[startIndex] ?? null;
  for (const snapshot of addedNodes) {
    target.insertBefore(snapshotToNode(snapshot), reference);
  }
}

/** Rebuilds `root`'s contents from scratch by seeding `initialSnapshot` and
 * re-applying every DOM mutation up to (and including) `upToTimestamp`, in
 * order. Always replaying from the baseline — rather than incrementally
 * mutating forward or backward — is what guarantees the same timestamp always
 * produces the same DOM, regardless of scrub direction. */
export function replayDom(
  root: Element,
  initialSnapshot: DomSnapshot[],
  mutations: Array<{ timestamp: number; payload: DomMutationPayload }>,
  upToTimestamp: number,
): void {
  root.innerHTML = "";
  for (const snapshot of initialSnapshot) {
    root.appendChild(snapshotToNode(snapshot));
  }
  for (const mutation of mutations) {
    if (mutation.timestamp > upToTimestamp) break;
    applyMutation(root, mutation.payload);
  }
}
