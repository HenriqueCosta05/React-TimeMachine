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

  // childList: replay only supports appends, matching the recorder's current
  // capture (it doesn't record sibling position, so out-of-order inserts and
  // removals can't be reconstructed exactly yet).
  for (const snapshot of payload.addedNodes ?? []) {
    target.appendChild(snapshotToNode(snapshot));
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
