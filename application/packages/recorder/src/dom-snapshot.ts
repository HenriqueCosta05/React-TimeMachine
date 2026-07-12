import type { DomSnapshot } from "@react-debugmachine/shared";

/** Recursively serializes a live DOM node into a structural snapshot. Unlike
 * `outerHTML`, this never merges adjacent text nodes, so indices computed
 * against the live DOM stay valid when the snapshot is rebuilt on replay. */
export function nodeToSnapshot(node: Node): DomSnapshot {
  if (node instanceof Element) {
    const attributes: Record<string, string> = {};
    for (const attr of Array.from(node.attributes)) {
      attributes[attr.name] = attr.value;
    }
    return {
      kind: "element",
      tag: node.tagName.toLowerCase(),
      attributes,
      children: Array.from(node.childNodes).map(nodeToSnapshot),
    };
  }

  return { kind: "text", text: node.textContent ?? "" };
}
