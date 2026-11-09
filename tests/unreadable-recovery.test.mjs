import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../components/beginner-academy.tsx", import.meta.url), "utf8");

test("unreadable academy bytes are exported unchanged and cannot be overwritten by an ordinary save", () => {
  assert.match(source, /unreadableRaw\.current!==null&&!replaceUnreadable/);
  assert.match(source, /damaged\?\?JSON\.stringify\(progress,null,2\)/);
  assert.match(source, /unreadable-recovery-/);
  assert.match(source, /commit\(p,true\)/);
});
