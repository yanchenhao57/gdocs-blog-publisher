import type { OptimizationChange } from "./types";

export function updateOptimizationChangeModified(
  changes: OptimizationChange[],
  index: number,
  modified: string
): OptimizationChange[] {
  return changes.map((change) =>
    change.index === index ? { ...change, modified } : change
  );
}
