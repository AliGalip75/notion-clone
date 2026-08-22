import { useAuthStore } from "@/stores/authStore";
import { FileText } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 animate-fade-in text-center h-full">
      <FileText
        size={48}
        className="mb-4"
        style={{ color: "var(--color-text-tertiary)" }}
      />
      <h1
        className="text-2xl font-bold mb-2"
        style={{ color: "var(--color-text)" }}
      >
        Merhaba, {user?.first_name || user?.email}!
      </h1>
      <p style={{ color: "var(--color-text-secondary)" }}>
        Başlamak için soldaki menüden yeni bir sayfa oluşturun veya var olan bir
        sayfayı seçin.
      </p>
    </div>
  );
}
