import { useAtomValue } from "jotai";
import { selectedFileAtom } from "./state";
import { useRef, useState } from "react";
import { useKeyPress } from "./utils";

export function PhotoSingle() {
  const file = useAtomValue(selectedFileAtom);

  const imageRef = useRef<HTMLImageElement | null>(null);
  const mousePosition = useRef({ x: 0, y: 0 });

  const [transform, setTransform] = useState<string>("");
  useKeyPress("z", () => {
    if (transform != "") {
      setTransform("");
    } else {
      let imageDisplayWidth = imageRef.current!.width;
      let imageDisplayHeight = imageRef.current!.height;
      let elementRect = imageRef.current!.getBoundingClientRect();
      let mouseX = mousePosition.current!.x;
      let mouseY = mousePosition.current!.y;

      let xRelative = imageDisplayWidth / 2 - (mouseX - elementRect.x);
      let yRelative = imageDisplayHeight / 2 - (mouseY - elementRect.y);

      let imageNaturalWidth = imageRef.current!.naturalWidth;
      let imageNaturalHeight = imageRef.current!.naturalHeight;
      let scale =
        1 +
        Math.max(imageNaturalWidth, imageNaturalHeight) /
          Math.max(imageDisplayWidth, imageDisplayHeight); /* *
        window.devicePixelRatio */
      setTransform(`scale(${scale}) translate(${xRelative}px, ${yRelative}px)`);
    }
  });

  return (
    <img
      className="img-fit"
      key={file}
      src={`photo://localhost${file}`}
      ref={imageRef}
      style={{
        transform,
        overflow: "hidden",
      }}
      onMouseMove={(e) => {
        mousePosition.current = { x: e.clientX, y: e.clientY };
      }}
    />
  );
}
