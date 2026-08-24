import React from "react";
import { Type, Heading, CheckSquare, ListOrdered, Percent, BarChart, Table as TableIcon, Image as ImageIcon } from "lucide-react";
import type { BlockType } from "@/types";

export const BLOCK_OPTIONS: { type: BlockType; label: string; icon: React.ReactNode }[] = [
  { type: "text", label: "Metin", icon: <Type size={16} /> },
  { type: "heading", label: "Başlık", icon: <Heading size={16} /> },
  { type: "checklist", label: "Yapılacaklar", icon: <CheckSquare size={16} /> },
  { type: "progress", label: "İlerleme", icon: <Percent size={16} /> },
  { type: "number", label: "Sayı", icon: <ListOrdered size={16} /> },
  { type: "chart", label: "Grafik", icon: <BarChart size={16} /> },
  { type: "table", label: "Tablo", icon: <TableIcon size={16} /> },
  { type: "image", label: "Görsel", icon: <ImageIcon size={16} /> },
];
