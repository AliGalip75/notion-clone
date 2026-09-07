import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableItemProps {
  id: string;
  children: (props: {
    attributes: any;
    listeners: any;
    isDragging: boolean;
  }) => React.ReactNode;
}

export default function SortableItem({ id, children }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
    activeIndex,
    index,
  } = useSortable({ id });

  // Sadece sürüklenen öğeye transform uyguluyoruz, diğerleri sabit kalıyor.
  // Bu sayede Notion'daki gibi yer değiştirme yerine araya çizgi çizme efekti yaratıyoruz.
  const style: React.CSSProperties = {
    transform: isDragging ? CSS.Translate.toString(transform) : undefined,
    transition: isDragging ? transition : undefined,
    opacity: isDragging ? 0.5 : 1,
    position: "relative",
    zIndex: isDragging ? 99 : "auto",
  };

  const showDropIndicatorTop = isOver && !isDragging && activeIndex > index;
  const showDropIndicatorBottom = isOver && !isDragging && activeIndex < index;

  return (
    <div ref={setNodeRef} style={style} className="relative w-full">
      {showDropIndicatorTop && (
        <div className="absolute -top-0.5 left-0 right-0 h-1 bg-blue-500 z-50 rounded" />
      )}
      
      {children({
        attributes,
        listeners,
        isDragging,
      })}

      {showDropIndicatorBottom && (
        <div className="absolute -bottom-0.5 left-0 right-0 h-1 bg-blue-500 z-50 rounded" />
      )}
    </div>
  );
}
