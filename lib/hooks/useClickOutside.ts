import { useEffect } from "react";

type UseClickOutsideOptions = {
  enabled?: boolean;
  onOutsideClick: () => void;
  onEscapeKey?: () => void;
};

export function useClickOutside(
  refs: React.RefObject<HTMLElement | null>[],
  { enabled = true, onOutsideClick, onEscapeKey }: UseClickOutsideOptions
) {
  useEffect(() => {
    if (!enabled) return;

    const handlePointerDown = (e: MouseEvent) => {
      const target = e.target as Node | null;

      const clickedInside = refs.some(
        (ref) => ref.current && ref.current.contains(target)
      );

      if (!clickedInside) {
        onOutsideClick();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onEscapeKey?.();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled, refs, onOutsideClick, onEscapeKey]);
}
