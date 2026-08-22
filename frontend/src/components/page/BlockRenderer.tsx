import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GripVertical, Trash2 } from "lucide-react";
import { pagesApi } from "@/api/pages";
import type { Block } from "@/types";

import TextBlock from "../blocks/TextBlock";
import HeadingBlock from "../blocks/HeadingBlock";
import ChecklistBlock from "../blocks/ChecklistBlock";
import ProgressBlock from "../blocks/ProgressBlock";
import NumberBlock from "../blocks/NumberBlock";
import ChartBlock from "../blocks/ChartBlock";
import TableBlock from "../blocks/TableBlock";

interface BlockRendererProps {
  block: Block;
}

export default function BlockRenderer({ block }: BlockRendererProps) {
  const queryClient = useQueryClient();

  const deleteBlock = useMutation({
    mutationFn: () => pagesApi.deleteBlock(block.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["page", block.page] });
    },
  });

  const renderComponent = () => {
    switch (block.type) {
      case "text": return <TextBlock block={block} />;
      case "heading": return <HeadingBlock block={block} />;
      case "checklist": return <ChecklistBlock block={block} />;
      case "progress": return <ProgressBlock block={block} />;
      case "number": return <NumberBlock block={block} />;
      case "chart": return <ChartBlock block={block} />;
      case "table": return <TableBlock block={block} />;
      default:
        return (
          <div className="p-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-md">
            <div className="text-xs text-red-500">Bilinmeyen blok tipi: {block.type}</div>
          </div>
        );
    }
  };

  return (
    <div className="group flex items-start gap-1 relative py-0.5">
      {/* Drag handle and actions */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center shrink-0 w-12 pt-2 -ml-12 absolute">
        <button 
          onClick={() => deleteBlock.mutate()}
          className="p-1 rounded text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-hover)] hover:text-red-500 transition-colors cursor-pointer mr-1"
          title="Sil"
        >
          <Trash2 size={14} />
        </button>
        <button 
          className="p-1 rounded text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-hover)] cursor-grab active:cursor-grabbing transition-colors"
          title="Taşı (Yapım Aşamasında)"
        >
          <GripVertical size={16} />
        </button>
      </div>
      
      {/* Block Content */}
      <div className="flex-1 min-w-0">
        {renderComponent()}
      </div>
    </div>
  );
}
