import { Link } from "react-router";
import { FileText } from "lucide-react";
import type { Page } from "@/types";

interface ChildPagesProps {
  childrenPages: Page[];
}

export default function ChildPages({ childrenPages }: ChildPagesProps) {
  if (!childrenPages || childrenPages.length === 0) return null;

  return (
    <div className="mt-8 pt-6 border-t border-[var(--color-border)]">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {childrenPages.map((child) => (
          <Link
            key={child.id}
            to={`/page/${child.id}`}
            className="flex items-center gap-3 p-3 rounded-md transition-colors cursor-pointer group"
            style={{ border: "1px solid var(--color-border)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-bg-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <div className="text-2xl shrink-0">{child.icon || "📄"}</div>
            <div className="min-w-0 flex-1">
              <h3
                className="text-sm font-medium truncate mb-0.5"
                style={{ color: "var(--color-text)" }}
              >
                {child.title}
              </h3>
              <p
                className="text-xs truncate flex items-center gap-1"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                {child.children_count > 0 && (
                  <span>
                    {child.children_count} alt sayfa
                  </span>
                )}
                {child.children_count > 0 && child.blocks_count > 0 && <span>•</span>}
                {child.blocks_count > 0 && (
                  <span>
                    {child.blocks_count} blok
                  </span>
                )}
                {child.children_count === 0 && child.blocks_count === 0 && (
                  <span>Boş sayfa</span>
                )}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
