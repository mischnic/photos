import { type ComponentType } from "react";
import { FixedSizeList, ListChildComponentProps } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { Box, Flex, FlexProps, Grid } from "@radix-ui/themes";
import { useAtomValue, useSetAtom } from "jotai";
import { filesAtom, selectedIndexAtom, viewAtom } from "./state";

export const GRID_TITLE_HEIGHT = 24;
const GRID_ROW_PADDING = 10;

export function GridCell({
  file,
  index,
  ...props
}: {
  file: string;
  index: number;
} & FlexProps) {
  const setSelected = useSetAtom(selectedIndexAtom);
  const setView = useSetAtom(viewAtom);

  return (
    <Flex
      className="grid-item"
      direction="column"
      minHeight="0"
      onClick={() => {
        setSelected(index);
      }}
      onDoubleClick={() => {
        setSelected(index);
        setView("single");
      }}
      {...props}
    >
      <Box minHeight="0" flexBasis="0" flexGrow="1">
        <img className="img-fit" src={`photo://localhost${file}?thumbnail`} />
      </Box>
      <Flex height={`${GRID_TITLE_HEIGHT}px`} justify="center" align="center">
        {file.split("/").at(-1)}
      </Flex>
    </Flex>
  );
}

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
          <GridCell index={index * columnCount + i} file={f} key={f} />
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
          GRID_TITLE_HEIGHT +
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
