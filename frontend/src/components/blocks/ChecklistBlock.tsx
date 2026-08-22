import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { pagesApi } from "@/api/pages";
import { Check, GripVertical, X } from "lucide-react";
import type { Block, ChecklistBlockData } from "@/types";

interface ChecklistBlockProps {
  block: Block;
}

export default function ChecklistBlock({ block }: ChecklistBlockProps) {
  const queryClient = useQueryClient();
  const data = block.data as unknown as ChecklistBlockData;
  const items = data.items || [];

  const updateBlock = useMutation({
    mutationFn: (newItems: ChecklistBlockData["items"]) =>
      pagesApi.updateBlock(block.id, { data: { items: newItems } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["page", block.page] });
    },
  });

  const toggleItem = (index: number) => {
    const newItems = [...items];
    newItems[index].completed = !newItems[index].completed;
    updateBlock.mutate(newItems);
  };

  const updateItemText = (index: number, text: string) => {
    const newItems = [...items];
    newItems[index].text = text;
    updateBlock.mutate(newItems);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    updateBlock.mutate(newItems);
  };

  const addItem = () => {
    updateBlock.mutate([...items, { text: "", completed: false }]);
  };

  return (
    <div className="py-1">
      {items.map((item, index) => (
        <div key={index} className="flex items-start gap-2 py-1 group">
          <button
            onClick={() => toggleItem(index)}
            className={`mt-0.5 shrink-0 w-4 h-4 flex items-center justify-center rounded cursor-pointer transition-colors ${
              item.completed
                ? "bg-[var(--color-primary)] text-white"
                : "border border-[var(--color-text-tertiary)] bg-transparent"
            }`}
          >
            {item.completed && <Check size={12} strokeWidth={3} />}
          </button>
          
          <input
            type="text"
            value={item.text}
            onChange={(e) => {
              const newItems = [...items];
              newItems[index].text = e.target.value;
              // Local state update would be better for performance, but this works for MVP
              // The updateItemText onBlur is a better approach to avoid too many requests
            }}
            onBlur={(e) => updateItemText(index, e.target.value)}
            placeholder="Yapılacak..."
            className={`flex-1 bg-transparent outline-none ${item.completed ? "line-through opacity-50" : ""}`}
            style={{ color: "var(--color-text)" }}
          />

          <button 
            onClick={() => removeItem(index)}
            className="opacity-0 group-hover:opacity-100 p-1 text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-hover)] rounded cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      ))}
      
      <div className="flex items-center gap-2 mt-1">
        <button
          onClick={addItem}
          className="text-sm px-2 py-1 text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-hover)] rounded cursor-pointer transition-colors"
        >
          + Yeni madde
        </button>
      </div>
    </div>
  );
}
