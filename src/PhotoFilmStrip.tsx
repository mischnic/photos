import { createRef, useLayoutEffect, type ComponentType } from "react";
import { FixedSizeList, ListChildComponentProps } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { PhotoSingle } from "./PhotoSingle";
import { useAtomValue } from "jotai";
import { filesAtom, selectedIndexAtom } from "./state";
import { CELL_TITLE_HEIGHT, PhotoCell } from "./PhotoCell";

const STRIP_HEIGHT = 100;
const STRIP_PADDING = 10;

const StripCell: ComponentType<ListChildComponentProps> = ({
  index,
  style,
}) => {
  const files = useAtomValue(filesAtom)!;
  let f = files[index];
  return (
    <PhotoCell index={index} file={f} style={style} px={`${STRIP_PADDING}px`} />
  );
};

export function PhotoFilmStrip() {
  const files = useAtomValue(filesAtom)!;
  const selectedIndex = useAtomValue(selectedIndexAtom);

  const listRef = createRef<FixedSizeList>();

  useLayoutEffect(() => {
    listRef.current?.scrollToItem(selectedIndex, "smart");
  }, [selectedIndex]);

  let itemWidth =
    STRIP_HEIGHT * (3 / 2) + CELL_TITLE_HEIGHT + STRIP_PADDING * 2;
  return (
    <>
      <PhotoSingle />
      <AutoSizer disableHeight>
        {({ width }) => {
          return (
            <FixedSizeList
              itemSize={itemWidth}
              itemCount={files.length}
              height={STRIP_HEIGHT}
              width={width}
              className="root-strip"
              layout="horizontal"
              ref={listRef}
            >
              {StripCell}
            </FixedSizeList>
          );
        }}
      </AutoSizer>
    </>
  );
}
