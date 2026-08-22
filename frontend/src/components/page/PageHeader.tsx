import { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { pagesApi } from "@/api/pages";
import type { PageDetail } from "@/types";

interface PageHeaderProps {
  page: PageDetail;
}

export default function PageHeader({ page }: PageHeaderProps) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState(page.title);
  const [icon, setIcon] = useState(page.icon || "📄");
  
  const titleRef = useRef<HTMLTextAreaElement>(null);

  // Sync state if page changes
  useEffect(() => {
    setTitle(page.title);
    setIcon(page.icon || "📄");
  }, [page]);

  // Adjust textarea height automatically
  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.style.height = "auto";
      titleRef.current.style.height = titleRef.current.scrollHeight + "px";
    }
  }, [title]);

  const updatePage = useMutation({
    mutationFn: (data: { title?: string; icon?: string }) => pagesApi.update(page.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["page", page.id] });
      queryClient.invalidateQueries({ queryKey: ["pageTree"] });
    },
  });

  const handleTitleBlur = () => {
    if (title !== page.title) {
      updatePage.mutate({ title });
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      titleRef.current?.blur();
    }
  };

  return (
    <div className="mb-8 group">
      {/* Icon */}
      <div className="text-6xl mb-4 relative inline-block">
        <span className="cursor-pointer" title="İkonu Değiştir">
          {icon}
        </span>
        {/* Simple icon picker (MVP version) could be implemented here */}
      </div>

      {/* Title */}
      <textarea
        ref={titleRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={handleTitleBlur}
        onKeyDown={handleTitleKeyDown}
        placeholder="Sayfa Başlığı"
        rows={1}
        className="w-full text-4xl font-bold bg-transparent outline-none resize-none overflow-hidden placeholder:text-[var(--color-text-tertiary)]"
        style={{ color: "var(--color-text)" }}
      />
    </div>
  );
}
