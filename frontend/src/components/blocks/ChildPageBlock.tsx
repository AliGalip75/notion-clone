import { Link } from "react-router";
import { FileText } from "lucide-react";
import type { Page } from "@/types";

interface ChildPageBlockProps {
  page: Page;
}

export default function ChildPageBlock({ page }: ChildPageBlockProps) {
  return (
    <div className="py-0.5">
      <Link
        to={`/page/${page.id}`}
        className="flex items-center gap-2 px-1.5 py-1 rounded-sm hover:bg-[var(--color-bg-hover)] transition-colors text-[var(--color-text)] underline-offset-4 hover:underline"
      >
        <span className="text-[var(--color-text-tertiary)] opacity-80 flex items-center justify-center shrink-0">
          {page.icon && page.icon !== "📄" ? (
            <span className="text-base">{page.icon}</span>
          ) : (
            <FileText size={18} />
          )}
        </span>
        <span className="font-medium">{page.title}</span>
      </Link>
    </div>
  );
}
