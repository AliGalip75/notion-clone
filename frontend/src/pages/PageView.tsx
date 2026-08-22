import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { pagesApi } from "@/api/pages";
import PageHeader from "@/components/page/PageHeader";
import BlockRenderer from "@/components/page/BlockRenderer";
import ChildPages from "@/components/page/ChildPages";
import AddBlockMenu from "@/components/page/AddBlockMenu";

export default function PageView() {
  const { id } = useParams();
  const pageId = Number(id);

  const { data: page, isLoading, error } = useQuery({
    queryKey: ["page", pageId],
    queryFn: () => pagesApi.get(pageId).then((r) => r.data),
    enabled: !!pageId && !isNaN(pageId),
  });

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
      <div className="max-w-3xl mx-auto w-full px-12 py-16 animate-fade-in">
        <PageHeader page={page} />

        <div className="flex flex-col gap-1 min-h-[100px]">
          {page.blocks?.length === 0 ? (
            <p className="text-sm italic pl-1" style={{ color: "var(--color-text-tertiary)" }}>
              Sayfa henüz boş. Yeni blok eklemek için aşağıdaki menüyü kullanın.
            </p>
          ) : (
            page.blocks?.map((block) => (
              <BlockRenderer key={block.id} block={block} />
            ))
          )}
          
          <AddBlockMenu pageId={page.id} />
        </div>

        <ChildPages childrenPages={page.children} />
      </div>
    </div>
  );
}
