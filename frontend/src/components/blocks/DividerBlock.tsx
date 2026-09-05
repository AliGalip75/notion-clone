import { useEffect } from "react";
import type { Block } from "@/types";

interface DividerBlockProps {
  block: Block;
  autoFocus?: boolean;
}

export default function DividerBlock({ autoFocus }: DividerBlockProps) {
  // Focus on mount if autoFocus is true
  useEffect(() => {
    if (autoFocus) {
      // Just a visual focus effect if needed
    }
  }, [autoFocus]);

  return (
    <div className="py-3 flex items-center justify-center">
      <div className="w-full h-px bg-[var(--color-border)]" />
    </div>
  );
}
