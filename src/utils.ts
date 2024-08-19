import { useCallback } from "react";
import { useEvent } from "react-use";

export function useKeyPress(key: string, cb: (e: KeyboardEvent) => void) {
  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!e.repeat && e.key === key) cb(e);
    },
    [cb]
  );

  useEvent("keydown", onKeyDown);
}
