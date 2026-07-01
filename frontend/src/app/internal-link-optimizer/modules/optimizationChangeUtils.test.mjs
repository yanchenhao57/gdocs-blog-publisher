import test from "node:test";
import assert from "node:assert/strict";

const { updateOptimizationChangeModified } = await import(
  "./optimizationChangeUtils.ts"
);

test("updates only the matching optimization modified text", () => {
  const changes = [
    {
      index: 1,
      original: "First paragraph",
      modified: "First paragraph with [a link](https://example.com/a)",
    },
    {
      index: 2,
      original: "Second paragraph",
      modified: "Second paragraph with [another link](https://example.com/b)",
    },
  ];

  const updated = updateOptimizationChangeModified(
    changes,
    2,
    "Second paragraph with edited [anchor text](https://example.com/b)"
  );

  assert.notStrictEqual(updated, changes);
  assert.strictEqual(updated[0], changes[0]);
  assert.deepStrictEqual(updated[1], {
    ...changes[1],
    modified: "Second paragraph with edited [anchor text](https://example.com/b)",
  });
  assert.strictEqual(
    changes[1].modified,
    "Second paragraph with [another link](https://example.com/b)"
  );
});
