import type { DomMutationPayload } from "@react-debugmachine/shared";
import type { RecordingClock } from "./clock";
import { nodeToSnapshot } from "./dom-snapshot";

/** Path of child indices from `root` down to `node`, so a mutation can be replayed
 * against a differently-instantiated but structurally identical DOM tree. */
function pathFromRoot(root: Node, node: Node): number[] {
  const path: number[] = [];
  let current: Node | null = node;
  while (current && current !== root) {
    const parent: Node | null = current.parentNode;
    if (!parent) return path.reverse();
    path.push(Array.prototype.indexOf.call(parent.childNodes, current));
    current = parent;
  }
  return path.reverse();
}

function toMutationPayload(root: Node, record: MutationRecord): DomMutationPayload {
  if (record.type === "attributes") {
    const target = record.target as Element;
    return {
      kind: "attributes",
      targetPath: pathFromRoot(root, record.target),
      attributeName: record.attributeName ?? "",
      oldValue: record.oldValue,
      newValue: record.attributeName ? target.getAttribute(record.attributeName) : null,
    };
  }

  if (record.type === "characterData") {
    return {
      kind: "characterData",
      targetPath: pathFromRoot(root, record.target),
      oldValue: record.oldValue,
      newValue: record.target.textContent,
    };
  }

  return {
    kind: "childList",
    targetPath: pathFromRoot(root, record.target),
    addedNodes: Array.from(record.addedNodes).map(nodeToSnapshot),
    removedNodes: Array.from(record.removedNodes).map(nodeToSnapshot),
  };
}

/** MutationObserver callbacks are batched microtasks: by the time a batch runs,
 * a node added earlier in the *same* batch may already have descendants added
 * later in that batch as real children. Its snapshot (captured via
 * `nodeToSnapshot`) already includes them, so their own records in this batch —
 * anything targeting that node or a descendant of it — would double-apply
 * them on replay and must be dropped. */
function dropRecordsCoveredByThisBatch(root: Node, records: MutationRecord[]): MutationRecord[] {
  const addedRoots = records
    .filter((record) => record.type === "childList")
    .flatMap((record) => Array.from(record.addedNodes));

  return records.filter(
    (record) => !addedRoots.some((addedRoot) => addedRoot.contains(record.target)),
  );
}

export interface DomObserverOptions {
  root: Node;
  clock: RecordingClock;
  onMutation: (payload: DomMutationPayload, timestamp: number) => void;
}

/** Wraps `MutationObserver` to turn raw mutation records into the shared event
 * schema's `DomMutationPayload`, path-addressed relative to the recorded root. */
export function installDomObserver(options: DomObserverOptions): () => void {
  const observer = new MutationObserver((records) => {
    for (const record of dropRecordsCoveredByThisBatch(options.root, records)) {
      options.onMutation(toMutationPayload(options.root, record), options.clock.elapsed());
    }
  });

  observer.observe(options.root, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeOldValue: true,
    characterData: true,
    characterDataOldValue: true,
  });

  return () => observer.disconnect();
}
