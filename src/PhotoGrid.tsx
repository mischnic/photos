import { type ComponentType } from "react";
import { FixedSizeList, ListChildComponentProps } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { Grid } from "@radix-ui/themes";
import { useAtomValue } from "jotai";
import { filesAtom } from "./state";
import { CELL_TITLE_HEIGHT, PhotoCell } from "./PhotoCell";

const GRID_ROW_PADDING = 4;

const GridRow: ComponentType<
  ListChildComponentProps<{ files: Array<string>; columnCount: number }>
> = ({ index, style, data: { files, columnCount } }) => {
  let row = files.slice(index * columnCount, index * columnCount + columnCount);
  return (
    <Grid
      style={style}
      className="grid-row"
      columns="repeat(var(--col-count), 1fr)"
      gap="5px"
      py={`${GRID_ROW_PADDING}px`}
    >
      {row.map((f, i) =>
        f ? (
          <PhotoCell index={index * columnCount + i} file={f} key={f} />
        ) : (
          <div></div>
        )
      )}
    </Grid>
  );
};

export function PhotoGrid() {
  const files = useAtomValue(filesAtom)!;

  return (
    <AutoSizer>
      {({ height, width }) => {
        let minWidth = 350 + 20;
        let columnCount = Math.floor(width / minWidth);
        let rowHeight =
          (width / columnCount) * (2 / 3) +
          CELL_TITLE_HEIGHT +
          GRID_ROW_PADDING * 2;
        return (
          <FixedSizeList
            itemSize={rowHeight}
            itemCount={Math.ceil(files.length / columnCount)}
            height={height}
            width={width}
            itemData={{ files: files, columnCount }}
            // @ts-ignore
            style={{ "--col-count": columnCount }}
          >
            {GridRow}
          </FixedSizeList>
        );
      }}
    </AutoSizer>
  );
}
