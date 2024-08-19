import { atom } from "jotai";

export const projectAtom = atom<string | null>(
  "/Users/niklas/Downloads/100_FUJI/"
);
export const filesAtom = atom<Array<string> | null>(null);

export const selectedIndexAtom = atom(0);
export const viewAtom = atom<"grid" | "filmstrip" | "single">("grid");

export const selectedFileAtom = atom((get) => {
  const files = get(filesAtom);
  const index = get(selectedIndexAtom);
  return files?.[index];
});
