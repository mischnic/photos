import { Flex, FlexProps, Text } from "@radix-ui/themes";
import { useSetAtom } from "jotai";
import { selectedIndexAtom, viewAtom } from "./state";
import { RadiusBox } from "./utils";

export const CELL_TITLE_HEIGHT = 24;

export function PhotoCell({
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
      <RadiusBox
        minHeight="0"
        flexBasis="0"
        flexGrow="1"
        radius="large"
        overflow="hidden"
      >
        <img className="img-fit" src={`photo://localhost${file}?thumbnail`} />
      </RadiusBox>
      <Flex height={`${CELL_TITLE_HEIGHT}px`} justify="center" align="center">
        <Text size="2">{file.split("/").at(-1)}</Text>
      </Flex>
    </Flex>
  );
}
