import { forwardRef, useCallback } from "react";
import { useEvent } from "react-use";
import { Box, type BoxProps } from "@radix-ui/themes";
import clsx from "clsx";

export const RadiusBox: React.ForwardRefExoticComponent<
  BoxProps &
    React.RefAttributes<HTMLDivElement> & {
      radius?: "none" | "small" | "medium" | "large" | "full";
    }
> = forwardRef(({ children, radius, className, ...props }, ref) => {
  return (
    <Box
      {...props}
      ref={ref}
      className={clsx(className, "radius-box")}
      data-radius={radius}
    >
      {children}
    </Box>
  );
});

export function useKeyPress(key: string, cb: (e: KeyboardEvent) => void) {
  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!e.repeat && e.key === key) cb(e);
    },
    [cb]
  );

  useEvent("keydown", onKeyDown);
}
