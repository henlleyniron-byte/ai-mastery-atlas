// Compare the stored copy before each write so an older tab cannot erase a newer one.
export function createSnapshotWriter(storage: Pick<Storage, "getItem" | "setItem">, key: string, onProblem: (kind: "conflict" | "storage") => void) {
  let baseline: string | null = null;
  let pending: string | null = null;
  let paused = true;
  return {
    resume() {
      try { baseline = storage.getItem(key); paused = false; return true; }
      catch { paused = true; onProblem("storage"); return false; }
    },
    pause() { paused = true; },
    discard() { pending = null; },
    queue(value: string) { pending = value; },
    flush() {
      if (paused || pending === null) return;
      try {
        if (storage.getItem(key) !== baseline) { paused = true; onProblem("conflict"); return; }
        if (pending !== baseline) storage.setItem(key, pending);
        baseline = pending; pending = null;
      } catch { onProblem("storage"); }
    },
  };
}
