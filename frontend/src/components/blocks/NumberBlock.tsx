import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { pagesApi } from "@/api/pages";
import type { Block, NumberBlockData } from "@/types";

interface NumberBlockProps {
  block: Block;
}

export default function NumberBlock({ block }: NumberBlockProps) {
  const queryClient = useQueryClient();
  const data = block.data as unknown as NumberBlockData;
  const [title, setTitle] = useState(data.title || "Sayı");
  const [value, setValue] = useState(data.value || 0);
  const [unit, setUnit] = useState(data.unit || "");

  const updateBlock = useMutation({
    mutationFn: (newData: Partial<NumberBlockData>) =>
      pagesApi.updateBlock(block.id, { data: { ...data, ...newData } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["page", block.page] });
    },
  });

  return (
    <div className="py-2 inline-flex flex-col">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={() => { if (title !== data.title) updateBlock.mutate({ title }); }}
        className="text-xs font-semibold uppercase bg-transparent outline-none mb-1"
        style={{ color: "var(--color-text-secondary)" }}
      />
      <div className="flex items-baseline gap-1">
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          onBlur={() => { if (value !== data.value) updateBlock.mutate({ value }); }}
          className="text-4xl font-bold bg-transparent outline-none hide-arrows w-24"
          style={{ color: "var(--color-text)" }}
        />
        <input
          type="text"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          onBlur={() => { if (unit !== data.unit) updateBlock.mutate({ unit }); }}
          placeholder="Birim"
          className="text-xl font-medium bg-transparent outline-none w-16"
          style={{ color: "var(--color-text-tertiary)" }}
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
