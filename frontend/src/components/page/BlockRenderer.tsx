import { useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GripVertical, Trash2, Move } from "lucide-react";
import { pagesApi } from "@/api/pages";
import type { Block, BlockType } from "@/types";

import TextBlock from "../blocks/TextBlock";
import HeadingBlock from "../blocks/HeadingBlock";
import ChecklistBlock from "../blocks/ChecklistBlock";
import ProgressBlock from "../blocks/ProgressBlock";
import NumberBlock from "../blocks/NumberBlock";
import ChartBlock from "../blocks/ChartBlock";
import TableBlock from "../blocks/TableBlock";
import ImageBlock from "../blocks/ImageBlock";
import BulletedListBlock from "../blocks/BulletedListBlock";
import NumberedListBlock from "../blocks/NumberedListBlock";
import DividerBlock from "../blocks/DividerBlock";

interface BlockRendererProps {
  block: Block;
  dragHandleProps?: {
    attributes: Record<string, any>;
    listeners: Record<string, any>;
  };
  onInsertBlockAfter?: (type: BlockType) => void;
  autoFocus?: boolean;
}

export default function BlockRenderer({ block, dragHandleProps, onInsertBlockAfter, autoFocus }: BlockRendererProps) {
  const queryClient = useQueryClient();
  
  // Track type changes to auto-focus when a block transforms
  const prevTypeRef = useRef(block.type);
  const isTypeChanged = prevTypeRef.current !== block.type;
  
  useEffect(() => {
    prevTypeRef.current = block.type;
  }, [block.type]);

  const shouldFocus = autoFocus || isTypeChanged;

  const deleteBlock = useMutation({
    mutationFn: () => pagesApi.deleteBlock(block.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["page", block.page] });
    },
  });

  const renderComponent = () => {
    switch (block.type) {
      case "text": return <TextBlock block={block} onEnter={() => onInsertBlockAfter?.("text")} autoFocus={shouldFocus} onDelete={() => deleteBlock.mutate()} />;
      case "heading": return <HeadingBlock block={block} onEnter={() => onInsertBlockAfter?.("text")} autoFocus={shouldFocus} onDelete={() => deleteBlock.mutate()} />;
      case "checklist": return <ChecklistBlock block={block} autoFocus={shouldFocus} onDelete={() => deleteBlock.mutate()} />;
      case "progress": return <ProgressBlock block={block} />;
      case "number": return <NumberBlock block={block} />;
      case "chart": return <ChartBlock block={block} />;
      case "table": return <TableBlock block={block} />;
      case "bulleted_list": return <BulletedListBlock block={block} onEnter={() => onInsertBlockAfter?.("bulleted_list")} autoFocus={shouldFocus} onDelete={() => deleteBlock.mutate()} />;
      case "numbered_list": return <NumberedListBlock block={block} onEnter={() => onInsertBlockAfter?.("numbered_list")} autoFocus={shouldFocus} onDelete={() => deleteBlock.mutate()} />;
      case "divider": return <DividerBlock block={block} autoFocus={shouldFocus} />;
      case "image": return <ImageBlock block={block} />;
      default:
        return (
          <div className="p-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-md">
            <div className="text-xs text-red-500">Bilinmeyen blok tipi: {block.type}</div>
          </div>
        );
    }
  };

  return (
    <div className="group flex items-center gap-1 relative py-0.5">
      {/* Drag handle and actions */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end shrink-0 w-12 -ml-12 pr-2 absolute left-0">
        <button
          onClick={() => deleteBlock.mutate()}
          className="w-6 h-6 flex items-center justify-center rounded text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-hover)] hover:text-red-500 transition-colors cursor-pointer"
        >
          <Trash2 size={14} />
        </button>
        <button
          className="w-6 h-6 flex items-center justify-center rounded text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-hover)] cursor-grab active:cursor-grabbing transition-colors ms-1"
          {...dragHandleProps?.attributes}
          {...dragHandleProps?.listeners}
        >
          <Move size={14} />
        </button>
      </div>

      {/* Block Content */}
      <div className="flex-1 min-w-0">
        {renderComponent()}
      </div>
    </div>
  );
}
