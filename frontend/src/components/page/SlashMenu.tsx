import { useEffect, useState } from "react";
import { Type, Heading, CheckSquare, ListOrdered, List, Minus, Percent, BarChart, Table, Image as ImageIcon } from "lucide-react";
import type { BlockType } from "@/types";

export interface SlashMenuOption {
  type: BlockType;
  label: string;
  icon: React.ReactNode;
}

export const ALL_OPTIONS: SlashMenuOption[] = [
  { type: "text", label: "Metin", icon: <Type size={16} /> },
  { type: "heading", label: "Başlık 1", icon: <Heading size={16} /> },
  { type: "checklist", label: "Yapılacaklar", icon: <CheckSquare size={16} /> },
  { type: "bulleted_list", label: "Madde İmi", icon: <List size={16} /> },
  { type: "numbered_list", label: "Numaralı Liste", icon: <ListOrdered size={16} /> },
  { type: "divider", label: "Ayırıcı", icon: <Minus size={16} /> },
  { type: "progress", label: "İlerleme", icon: <Percent size={16} /> },
  { type: "number", label: "Sayı", icon: <ListOrdered size={16} /> },
  { type: "chart", label: "Grafik", icon: <BarChart size={16} /> },
  { type: "table", label: "Tablo", icon: <Table size={16} /> },
  { type: "image", label: "Görsel", icon: <ImageIcon size={16} /> },
];

interface SlashMenuProps {
  query: string;
  isOpen: boolean;
  onSelect: (type: BlockType) => void;
  onClose: () => void;
  selectedIndex: number;
}

export default function SlashMenu({ query, isOpen, onSelect, onClose, selectedIndex }: SlashMenuProps) {
  const [options, setOptions] = useState<SlashMenuOption[]>(ALL_OPTIONS);

  useEffect(() => {
    if (query) {
      const lowerQuery = query.toLowerCase();
      setOptions(ALL_OPTIONS.filter((opt) => opt.label.toLowerCase().includes(lowerQuery)));
    } else {
      setOptions(ALL_OPTIONS);
    }
  }, [query]);

  if (!isOpen || options.length === 0) return null;

  return (
    <div
      className="absolute left-0 top-full mt-1 w-56 rounded-md shadow-lg py-1 z-50 animate-scale-in"
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        boxShadow: "var(--shadow-popup)",
      }}
    >
      <div className="px-3 py-2 text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">
        Blok Türleri
      </div>
      {options.map((opt, index) => (
        <button
          key={opt.type}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onSelect(opt.type);
          }}
          className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-[var(--color-text)] transition-colors ${
            index === selectedIndex ? "bg-[var(--color-bg-hover)]" : "hover:bg-[var(--color-bg-hover)]"
          }`}
        >
          <div className="text-[var(--color-text-secondary)]">{opt.icon}</div>
          {opt.label}
        </button>
      ))}
    </div>
  );
}
