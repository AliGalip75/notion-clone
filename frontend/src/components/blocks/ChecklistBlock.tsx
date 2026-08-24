import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { pagesApi } from "@/api/pages";
import { Check, X } from "lucide-react";
import type { Block, ChecklistBlockData } from "@/types";

interface ChecklistBlockProps {
  block: Block;
}

export default function ChecklistBlock({ block }: ChecklistBlockProps) {
  const queryClient = useQueryClient();
  const data = block.data as unknown as ChecklistBlockData;
  const [localItems, setLocalItems] = useState(data.items || []);

  useEffect(() => {
    setLocalItems(data.items || []);
  }, [data.items]);

  const updateBlock = useMutation({
    mutationFn: (newItems: ChecklistBlockData["items"]) =>
      pagesApi.updateBlock(block.id, { data: { items: newItems } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["page", block.page] });
    },
  });

  const handleBlur = () => {
    updateBlock.mutate(localItems);
  };

  const toggleItem = (index: number) => {
    const newItems = [...localItems];
    newItems[index].completed = !newItems[index].completed;
    setLocalItems(newItems);
    updateBlock.mutate(newItems);
  };

  const removeItem = (index: number) => {
    const newItems = localItems.filter((_, i) => i !== index);
    setLocalItems(newItems);
    updateBlock.mutate(newItems);
  };

  const addItem = (index?: number) => {
    const newItems = [...localItems];
    if (typeof index === "number") {
      newItems.splice(index + 1, 0, { text: "", completed: false });
    } else {
      newItems.push({ text: "", completed: false });
    }
    setLocalItems(newItems);
    updateBlock.mutate(newItems);

    // Focus next input
    setTimeout(() => {
      const targetIndex = typeof index === "number" ? index + 1 : newItems.length - 1;
      const inputs = document.querySelectorAll(`input[data-checklist="${block.id}"]`);
      if (inputs[targetIndex]) {
        (inputs[targetIndex] as HTMLInputElement).focus();
      }
    }, 10);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addItem(index);
    } else if (e.key === "Backspace" && localItems[index].text === "") {
      e.preventDefault();
      if (localItems.length > 1) {
        removeItem(index);
        setTimeout(() => {
          const inputs = document.querySelectorAll(`input[data-checklist="${block.id}"]`);
          const targetIndex = index > 0 ? index - 1 : 0;
          if (inputs[targetIndex]) {
            (inputs[targetIndex] as HTMLInputElement).focus();
          }
        }, 10);
      }
    }
  };

  return (
    <div className="py-1">
      {localItems.map((item, index) => (
        <div key={index} className="flex items-center gap-2 py-1 group h-8">
          <button
            onClick={() => toggleItem(index)}
            className={`mt-0.5 shrink-0 w-4 h-4 flex items-center justify-center rounded cursor-pointer transition-colors ${item.completed
              ? "bg-blue-500 border border-blue-500 text-white"
              : "border border-[var(--color-text-tertiary)] bg-transparent"
              }`}
          >
            {item.completed && <Check size={12} strokeWidth={3} />}
          </button>

          <input
            type="text"
            data-checklist={block.id}
            value={item.text}
            onChange={(e) => {
              const newItems = [...localItems];
              newItems[index].text = e.target.value;
              setLocalItems(newItems);
            }}
            onBlur={handleBlur}
            onKeyDown={(e) => handleKeyDown(e, index)}
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
          onClick={() => addItem()}
          className="text-sm px-2 py-1 text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-hover)] rounded cursor-pointer transition-colors"
        >
          + Yeni madde
        </button>
      </div>
    </div>
  );
}
