import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { pagesApi } from "@/api/pages";
import type { Block, TextBlockData, BlockType } from "@/types";
import SlashMenu, { ALL_OPTIONS } from "../page/SlashMenu";

interface TextBlockProps {
  block: Block;
  onEnter?: () => void;
  autoFocus?: boolean;
  onDelete?: () => void;
}

export default function TextBlock({ block, onEnter, autoFocus, onDelete }: TextBlockProps) {
  const queryClient = useQueryClient();
  const data = block.data as unknown as TextBlockData;
  const [content, setContent] = useState(data.content || "");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus on mount if autoFocus is true
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(textareaRef.current.value.length, textareaRef.current.value.length);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Slash menu state
  const [slashQuery, setSlashQuery] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setContent(data.content || "");
  }, [data.content]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [content]);

  const updateBlockContent = useMutation({
    mutationFn: (newContent: string) =>
      pagesApi.updateBlock(block.id, { data: { content: newContent } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["page", block.page] });
    },
  });

  const transformBlock = useMutation({
    mutationFn: (type: BlockType) => {
      let defaultData: Record<string, unknown> = {};
      const newContentText = content.replace(/(?:^|\s)\/([a-zA-ZçğıöşüÇĞİÖŞÜ]*)$/, "");

      switch (type) {
        case "text": defaultData = { content: newContentText }; break;
        case "heading": defaultData = { content: newContentText, level: 1 }; break;
        case "checklist": defaultData = { items: [{ text: newContentText, completed: false }] }; break;
        case "progress": defaultData = { title: "İlerleme", value: 0, max: 100 }; break;
        case "number": defaultData = { title: "Sayı", value: 0, unit: "" }; break;
        case "chart": defaultData = { chartType: "bar", title: "Grafik", data: [{ label: "Öğe 1", value: 10 }] }; break;
        case "table": defaultData = { columns: ["Kolon 1", "Kolon 2"], rows: [{ cells: ["", ""] }] }; break;
        case "image": defaultData = { url: "", caption: "" }; break;
      }
      return pagesApi.updateBlock(block.id, { type, data: defaultData });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["page", block.page] });
      setSlashQuery(null);
    },
  });

  const handleBlur = () => {
    // Delay blur save so slash menu click can intercept
    setTimeout(() => {
      if (content !== data.content) {
        updateBlockContent.mutate(content);
      }
    }, 150);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setContent(newValue);

    const cursor = e.target.selectionStart;
    const textBeforeCursor = newValue.slice(0, cursor);
    const match = textBeforeCursor.match(/(?:^|\n|\s)\/([a-zA-ZçğıöşüÇĞİÖŞÜ]*)$/);

    if (match) {
      setSlashQuery(match[1]);
      setSelectedIndex(0);
    } else {
      setSlashQuery(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (slashQuery !== null) {
      const filteredOptions = ALL_OPTIONS.filter(opt => opt.label.toLowerCase().includes(slashQuery.toLowerCase()));
      const maxIndex = filteredOptions.length > 0 ? filteredOptions.length - 1 : 0;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, maxIndex));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        if (filteredOptions[selectedIndex]) {
          transformBlock.mutate(filteredOptions[selectedIndex].type);
        }
        return;
      }
      if (e.key === "Escape") {
        setSlashQuery(null);
        return;
      }
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      textareaRef.current?.blur();
      onEnter?.();
      return;
    }

    if ((e.key === "Backspace" || e.key === "Delete") && content === "") {
      e.preventDefault();
      onDelete?.();
      return;
    }
  };

  return (
    <div className="py-1 group relative">
      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder="Bir şeyler yazın veya komutlar için '/' tuşuna basın..."
        rows={1}
        className="w-full bg-transparent outline-none resize-none overflow-hidden placeholder:text-[var(--color-text-tertiary)]"
        style={{ color: "var(--color-text)" }}
      />
      <SlashMenu
        query={slashQuery || ""}
        isOpen={slashQuery !== null}
        selectedIndex={selectedIndex}
        onSelect={(type) => transformBlock.mutate(type)}
        onClose={() => setSlashQuery(null)}
      />
    </div>
  );
}
