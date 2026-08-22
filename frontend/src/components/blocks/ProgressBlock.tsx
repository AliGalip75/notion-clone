import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { pagesApi } from "@/api/pages";
import type { Block, ProgressBlockData } from "@/types";

interface ProgressBlockProps {
  block: Block;
}

export default function ProgressBlock({ block }: ProgressBlockProps) {
  const queryClient = useQueryClient();
  const data = block.data as unknown as ProgressBlockData;
  const [title, setTitle] = useState(data.title || "İlerleme");
  const [value, setValue] = useState(data.value || 0);
  const max = data.max || 100;

  const percentage = Math.min(Math.max(Math.round((value / max) * 100), 0), 100);

  const updateBlock = useMutation({
    mutationFn: (newData: Partial<ProgressBlockData>) =>
      pagesApi.updateBlock(block.id, { data: { ...data, ...newData } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["page", block.page] });
    },
  });

  const handleTitleBlur = () => {
    if (title !== data.title) updateBlock.mutate({ title });
  };

  const handleValueBlur = () => {
    if (value !== data.value) updateBlock.mutate({ value });
  };

  return (
    <div className="py-2">
      <div className="flex items-center justify-between mb-1">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
          className="text-sm font-medium bg-transparent outline-none flex-1"
          style={{ color: "var(--color-text)" }}
        />
        <div className="flex items-center gap-1 text-sm font-medium" style={{ color: "var(--color-primary)" }}>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            onBlur={handleValueBlur}
            className="w-12 text-right bg-transparent outline-none hide-arrows"
          />
          <span>/ {max}</span>
        </div>
      </div>
      
      <div 
        className="h-2 w-full rounded-full overflow-hidden"
        style={{ background: "var(--color-bg-active)" }}
      >
        <div 
          className="h-full transition-all duration-300 ease-out"
          style={{ 
            width: `${percentage}%`,
            background: "var(--color-primary)",
          }}
        />
      </div>
      <style>{`
        .hide-arrows::-webkit-outer-spin-button,
        .hide-arrows::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .hide-arrows {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
}
