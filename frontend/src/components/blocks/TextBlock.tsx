import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { pagesApi } from "@/api/pages";
import type { Block, TextBlockData } from "@/types";

interface TextBlockProps {
  block: Block;
}

export default function TextBlock({ block }: TextBlockProps) {
  const queryClient = useQueryClient();
  const data = block.data as unknown as TextBlockData;
  const [content, setContent] = useState(data.content || "");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setContent(data.content || "");
  }, [data.content]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [content]);

  const updateBlock = useMutation({
    mutationFn: (newContent: string) =>
      pagesApi.updateBlock(block.id, { data: { content: newContent } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["page", block.page] });
    },
  });

  const handleBlur = () => {
    if (content !== data.content) {
      updateBlock.mutate(content);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      textareaRef.current?.blur();
    }
  };

  return (
    <div className="py-1 group relative">
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder="Bir şeyler yazın..."
        rows={1}
        className="w-full bg-transparent outline-none resize-none overflow-hidden placeholder:text-[var(--color-text-tertiary)]"
        style={{ color: "var(--color-text)" }}
      />
    </div>
  );
}
