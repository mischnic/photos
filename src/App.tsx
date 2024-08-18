import { type ComponentType, useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { FixedSizeList, ListChildComponentProps } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";

import "./App.css";

const Cell = ({ file }: { file: string }) => {
  return (
    <div className="grid-item">
      <div>
        <img
          src={`photo://localhost${file}?thumbnail`}
          width="6000"
          height="4000"
        />
      </div>
      <div>{file.slice(-10)}</div>
    </div>
  );
  // <div style={style}>
  //   Item {rowIndex},{columnIndex}
  // </div>
};

const Row: ComponentType<
  ListChildComponentProps<{ files: Array<string>; columnCount: number }>
> = ({ index, style, data: { files, columnCount } }) => {
  let row = files.slice(index * columnCount, index * columnCount + columnCount);
  return (
    <div style={style} className="grid-row">
      {row.map((f) => (f ? <Cell file={f} key={f} /> : <div></div>))}
    </div>
  );
  // <div style={style}>
  //   Item {rowIndex},{columnIndex}
  // </div>
};

function App() {
  const [files, setFiles] = useState<Array<string>>([]);

  useEffect(() => {
    (async () => {
      // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
      console.log("list");
      setFiles(
        await invoke("list_files", {
          path: "/Users/niklas/Downloads/100_FUJI/",
        })
      );
    })();
  }, []);

  let files2 = files.slice(110, 116);

  return (
    <>
      {/* <img src="photo://localhost/Users/niklas/Downloads/100_FUJI/DSCF0124.JPG" /> */}

      <AutoSizer>
        {({ height, width }) => {
          let columnCount = Math.floor(width / 350);
          let rowHeight = (width / columnCount) * (2 / 3) + 70;
          console.log(
            width / columnCount,
            (width / columnCount) * (2 / 3),
            rowHeight
          );
          return (
            <FixedSizeList
              itemSize={rowHeight}
              itemCount={Math.ceil(files2.length / columnCount)}
              height={height}
              width={width}
              className="root-grid"
              itemData={{ files: files2, columnCount }}
              // @ts-ignore
              style={{ "--col-count": columnCount }}
            >
              {Row}
            </FixedSizeList>
          );
        }}
      </AutoSizer>

      {/* <div className="grid">
        {files.slice(110, 114).map((f) => (
          <div key={f}>
            <div>
              <img src={`photo://localhost${f}`} width="6000" height="4000" />
            </div>
            <div>{f.slice(-10)}</div>
          </div>
        ))}
      </div> */}
    </>
  );
}

export default App;
