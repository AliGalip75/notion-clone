import { Outlet, useNavigate, useLocation } from "react-router";
import AppSidebar from "@/components/sidebar/Sidebar";
import { useEffect, useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedPageId, setSelectedPageId] = useState<number | null>(null);

  // Sync selected page ID with current route
  useEffect(() => {
    const match = location.pathname.match(/\/page\/(\d+)/);
    if (match) {
      setSelectedPageId(Number(match[1]));
    } else {
      setSelectedPageId(null);
    }
  }, [location]);

  const handleSelectPage = (id: number) => {
    setSelectedPageId(id);
    navigate(`/page/${id}`);
  };

  return (
    <SidebarProvider>
      <div className="flex w-full h-screen overflow-hidden bg-background">
        <AppSidebar
          selectedPageId={selectedPageId}
          onSelectPage={handleSelectPage}
        />
        
        <main className="flex-1 flex flex-col relative h-full overflow-hidden w-full">
          <div className="absolute top-4 left-4 z-10">
            <SidebarTrigger />
          </div>
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}
