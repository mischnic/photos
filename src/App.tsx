import { useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import "@radix-ui/themes/styles.css";

import "./App.css";
import { Button, Flex } from "@radix-ui/themes";
import { PhotoGrid } from "./PhotoGrid";
import { PhotoFilmStrip } from "./PhotoFilmStrip";
import { useAtom, useSetAtom } from "jotai";
import { filesAtom, projectAtom, selectedIndexAtom, viewAtom } from "./state";
import { useKeyPressEvent } from "react-use";
import { PhotoSingle } from "./PhotoSingle";
import { useKeyPress } from "./utils";

function listFiles(folder: string): Promise<Array<string>> {
  return invoke("list_files", {
    path: folder,
  });
}

function pickFolder(): Promise<string | null> {
  return invoke("pick_folder");
}

const DigitViewMapping = {
  Digit1: "single",
  Digit2: "filmstrip",
  Digit3: "grid",
};

function App() {
  let [folder, setFolder] = useAtom(projectAtom);
  let [view, setView] = useAtom(viewAtom);
  let setSelectedIndex = useSetAtom(selectedIndexAtom);
  const [files, setFiles] = useAtom(filesAtom);

  useKeyPressEvent(
    (e) => e.code in DigitViewMapping,
    (e) => {
      if (e.metaKey) {
        // @ts-ignore
        setView(DigitViewMapping[e.code] as View);
      }
    }
  );

  useKeyPress("ArrowLeft", () => {
    setSelectedIndex((i) => Math.max(0, i - 1));
  });
  useKeyPress("ArrowRight", () => {
    setSelectedIndex((i) => Math.min(files?.length ?? Infinity, i + 1));
  });

  useEffect(() => {
    (async () => {
      if (folder) {
        setFiles(await listFiles(folder));
      }
    })();
  }, [folder]);

  if (!folder) {
    return (
      <Flex direction="column" align="center" justify="center" flexGrow="1">
        <Button
          onClick={async () => {
            let path = await pickFolder();
            if (path) {
              setFolder(path);
            }
          }}
        >
          Select project
        </Button>
      </Flex>
    );
  }

  if (!files) {
  } else if (view === "grid") {
    return <PhotoGrid />;
  } else if (view === "filmstrip") {
    return <PhotoFilmStrip />;
  } else {
    return <PhotoSingle />;
  }
}

export default App;
