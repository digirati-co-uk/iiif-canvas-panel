import type { Vault } from "@iiif/helpers/vault";
import { findFirstCanvasFromRangeWithSelector } from "@iiif/helpers/ranges";
import { parseSelector, type ParsedSelector } from "@iiif/helpers/annotation-targets";
import type { RangeNormalized } from "@iiif/parser/presentation-3-normalized/types";

export function getRangeTarget(vault: Vault, range: RangeNormalized) {
  const target = findFirstCanvasFromRangeWithSelector(vault, range);
  const source = target?.source;
  const sourceId = typeof source === "string" ? source : source?.id;
  if (!target || !sourceId) return undefined;

  const [canvasId, sourceFragment] = sourceId.split("#");
  const rawSelector = target.selector;
  const fragment =
    rawSelector &&
    typeof rawSelector === "object" &&
    "type" in rawSelector &&
    rawSelector.type === "FragmentSelector" &&
    typeof rawSelector.value === "string"
      ? rawSelector.value
      : sourceFragment;
  const selector = fragment ? `${canvasId}#${fragment}` : canvasId;
  let parsedSelector: ParsedSelector | undefined;
  try {
    parsedSelector = parseSelector(rawSelector || selector);
  } catch {
    // An unsupported selector must not prevent navigating to the canvas.
  }

  return {
    canvasId,
    fragment,
    selector,
    parsedSelector,
  };
}
