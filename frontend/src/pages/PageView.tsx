import React, { useMemo, useState, useEffect } from "react";
import { useParams } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { GripVertical } from "lucide-react";

import { pagesApi } from "@/api/pages";
import PageHeader from "@/components/page/PageHeader";
import BlockRenderer from "@/components/page/BlockRenderer";
import ChildPageBlock from "@/components/blocks/ChildPageBlock";
import SortableItem from "@/components/page/SortableItem";
import AddBlockDivider from "@/components/page/AddBlockDivider";
import BigAddBlockButton from "@/components/page/BigAddBlockButton";
import type { BlockType } from "@/types";

export default function PageView() {
  const { id } = useParams();
  const pageId = Number(id);
  const queryClient = useQueryClient();

  const { data: page, isLoading, error } = useQuery({
    queryKey: ["page", pageId],
    queryFn: () => pagesApi.get(pageId).then((r) => r.data),
    enabled: !!pageId && !isNaN(pageId),
  });

  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    if (page) {
      const combined = [
        ...(page.blocks || []).map((b: any) => ({ ...b, _type: "block", _id: `block-${b.id}` })),
        ...(page.children || []).map((p: any) => ({ ...p, _type: "page", _id: `page-${p.id}` }))
      ];
      combined.sort((a, b) => (a.position || 0) - (b.position || 0));
      setItems(combined);
    }
  }, [page]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const reorderMutation = useMutation({
    mutationFn: (newItems: any[]) => {
      const payload = newItems.map(item => ({
        type: item._type,
        id: item.id
      }));
      return pagesApi.reorderContent(pageId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["page", pageId] });
      queryClient.invalidateQueries({ queryKey: ["pageTree"] });
    }
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((i) => i._id === active.id);
        const newIndex = items.findIndex((i) => i._id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);
        reorderMutation.mutate(newItems);
        return newItems;
      });
    }
  };

  const handleAddBlockAfter = async (afterId: string | null, type: BlockType, initialData?: any) => {
    if (!page) return;

    let defaultData: Record<string, unknown> = {};
    if (initialData) {
      defaultData = initialData;
    } else {
      switch (type) {
        case "text": defaultData = { content: "" }; break;
        case "heading": defaultData = { content: "", level: 1 }; break;
        case "checklist": defaultData = { items: [{ text: "", completed: false }] }; break;
        case "progress": defaultData = { title: "İlerleme", value: 0, max: 100 }; break;
        case "number": defaultData = { title: "Sayı", value: 0, unit: "" }; break;
        case "chart": defaultData = { chartType: "bar", title: "Grafik", data: [{ label: "Oca", "Desktop": 30, "Mobile": 12, "Tablet": 18 }, { label: "Şub", "Desktop": 45, "Mobile": 25, "Tablet": 20 }] }; break;
        case "table": defaultData = { hasRowHeader: false, hasColumnHeader: false, cells: [["", "", ""], ["", "", ""], ["", "", ""]] }; break;
        case "image": defaultData = { url: "", caption: "" }; break;
      }
    }

    try {
      const res = await pagesApi.createBlock(pageId, { type, data: defaultData });
      const newBlock = { ...res.data, _type: "block", _id: `block-${res.data.id}` };

      setItems((currentItems) => {
        const index = afterId ? currentItems.findIndex(i => i._id === afterId) : -1;
        const newItems = [...currentItems];

        if (index === -1) {
          newItems.push(newBlock);
        } else {
          newItems.splice(index + 1, 0, newBlock);
        }

        reorderMutation.mutate(newItems);
        return newItems;
      });
    } catch (error) {
      console.error("Failed to insert block:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <div className="w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-[spin_1s_linear_infinite]" />
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="flex-1 flex items-center justify-center h-full" style={{ color: "var(--color-text-secondary)" }}>
        Sayfa yüklenemedi veya bulunamadı.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto notion-scrollbar relative h-full">
      <div className="w-full max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-7xl mx-auto pl-16 pr-6 sm:px-20 py-16 animate-fade-in">
        <PageHeader page={page} />

        <div className="flex flex-col gap-1 min-h-[100px] pb-32">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={items.map(i => i._id)}
              strategy={verticalListSortingStrategy}
            >
              {items.map((item, index) => (
                <React.Fragment key={item._id}>
                  {index > 0 && (
                    <AddBlockDivider onAdd={(type, data) => { handleAddBlockAfter(items[index - 1]._id, type, data); }} />
                  )}
                  <SortableItem id={item._id}>
                    {({ attributes, listeners, isDragging }) => (
                      <div className={`group flex items-start gap-1 relative ${isDragging ? 'z-50' : ''}`}>
                        {item._type === "page" ? (
                          <>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end shrink-0 w-16 pt-2 -ml-16 pr-2 absolute z-10">
                              <button
                                  className="w-6 h-6 flex items-center justify-center rounded text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-hover)] cursor-grab active:cursor-grabbing transition-colors"
                                  {...attributes}
                                  {...listeners}
                                >
                                  <GripVertical size={16} />
                                </button>
                            </div>
                            <div className="flex-1 min-w-0">
                              <ChildPageBlock page={item} />
                            </div>
                          </>
                        ) : (
                          <div className="flex-1 min-w-0">
                            <BlockRenderer
                              block={item}
                              dragHandleProps={{ attributes, listeners }}
                              onInsertBlockAfter={(type) => { handleAddBlockAfter(item._id, type); }}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </SortableItem>
                </React.Fragment>
              ))}
            </SortableContext>
          </DndContext>
          <BigAddBlockButton onAdd={(type, data) => { handleAddBlockAfter(items.length > 0 ? items[items.length - 1]._id : null, type, data); }} />
        </div>
      </div>
    </div>
  );
}
