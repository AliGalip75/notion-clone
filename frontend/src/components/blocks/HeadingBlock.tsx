import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { pagesApi } from "@/api/pages";
import type { Block, HeadingBlockData } from "@/types";

interface HeadingBlockProps {
  block: Block;
  onEnter?: () => void;
}

export default function HeadingBlock({ block, onEnter }: HeadingBlockProps) {
  const queryClient = useQueryClient();
  const data = block.data as unknown as HeadingBlockData;
  const [content, setContent] = useState(data.content || "");
  const [level, setLevel] = useState<1 | 2 | 3>(data.level || 1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setContent(data.content || "");
    setLevel(data.level || 1);
  }, [data.content, data.level]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [content, level]);

  const updateBlock = useMutation({
    mutationFn: (newData: { content?: string; level?: 1 | 2 | 3 }) =>
      pagesApi.updateBlock(block.id, { data: { ...data, ...newData } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["page", block.page] });
    },
  });

  const handleBlur = () => {
    if (content !== data.content) {
      updateBlock.mutate({ content });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      textareaRef.current?.blur();
      onEnter?.();
    }
  };

  // Determine text size based on heading level
  const sizeClasses = {
    1: "text-3xl font-bold mt-2 mb-2",
    2: "text-2xl font-bold mt-2 mb-2",
    3: "text-xl font-semibold mt-2 mb-2",
  };

  return (
    <div className="group relative flex items-start gap-2">
      {/* Level Switcher (visible on hover) */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 shrink-0 absolute right-2 top-2 z-10 bg-background/80 backdrop-blur-sm p-1 rounded-md border border-[var(--color-border)] shadow-sm">
        {[1, 2, 3].map((l) => (
          <button
            key={l}
            onClick={() => updateBlock.mutate({ level: l as 1 | 2 | 3 })}
            className={`w-5 h-5 rounded text-xs flex items-center justify-center transition-colors ${level === l
              ? "bg-[var(--color-bg-active)] text-[var(--color-text)]"
              : "text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-hover)]"
              }`}
            title={`H${l}`}
          >
            H{l}
          </button>
        ))}
      </div>

      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={`Başlık ${level}`}
        rows={1}
        className={`w-full bg-transparent outline-none resize-none overflow-hidden placeholder:text-[var(--color-text-tertiary)] ${sizeClasses[level]}`}
        style={{ color: "var(--color-text)" }}
      />
    </div>
  );
}
