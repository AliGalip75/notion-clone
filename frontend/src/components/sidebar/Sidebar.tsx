import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "@/stores/authStore";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pagesApi } from "@/api/pages";
import type { PageTreeNode } from "@/types";
import {
  ChevronRight,
  Plus,
  LogOut,
  Sun,
  Moon,
  FileText,
  ChevronsUpDown,
  BookOpen,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AppSidebarProps {
  selectedPageId: number | null;
  onSelectPage: (id: number) => void;
}

export default function AppSidebar({ selectedPageId, onSelectPage }: AppSidebarProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const queryClient = useQueryClient();
  const { isMobile } = useSidebar();
  
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));

  const { data: tree = [] } = useQuery({
    queryKey: ["pageTree"],
    queryFn: () => pagesApi.tree().then((r) => r.data),
  });

  const createPage = useMutation({
    mutationFn: () => pagesApi.create({ title: "Yeni Sayfa", icon: "📄" }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["pageTree"] });
      onSelectPage(res.data.id);
    },
  });

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <BookOpen className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Notion Clone</span>
                <span className="truncate text-xs">Workspace</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent className="notion-scrollbar">
        <SidebarGroup>
          <SidebarGroupLabel>Sayfalar</SidebarGroupLabel>
          <SidebarGroupAction title="Yeni Sayfa" onClick={() => createPage.mutate()}>
            <Plus /> <span className="sr-only">Yeni Sayfa</span>
          </SidebarGroupAction>
          <SidebarGroupContent>
            {tree.length === 0 ? (
              <div className="px-3 py-4 text-center group-data-[collapsible=icon]:hidden">
                <FileText className="mx-auto mb-2 text-muted-foreground" size={24} />
                <p className="text-xs text-muted-foreground">Henüz sayfa yok</p>
              </div>
            ) : (
              <SidebarMenu>
                {tree.map((node) => (
                  <TreeItem
                    key={node.id}
                    node={node}
                    selectedId={selectedPageId}
                    onSelect={onSelectPage}
                  />
                ))}
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-accent text-sidebar-foreground border">
                    {user?.first_name?.[0] || user?.email?.[0] || "U"}
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user?.full_name || user?.email}</span>
                    <span className="truncate text-xs">{user?.email}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                align="start"
                side={isMobile ? "bottom" : "right"}
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-accent text-sidebar-foreground border">
                      {user?.first_name?.[0] || user?.email?.[0] || "U"}
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{user?.full_name || user?.email}</span>
                      <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={toggleTheme}>
                  {isDark ? <Sun className="mr-2 size-4" /> : <Moon className="mr-2 size-4" />}
                  {isDark ? "Açık Mod" : "Koyu Mod"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 size-4" />
                  Çıkış Yap
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function TreeItem({
  node,
  selectedId,
  onSelect,
}: {
  node: PageTreeNode;
  selectedId: number | null;
  onSelect: (id: number) => void;
}) {
  const hasChildren = node.children.length > 0;
  const isSelected = selectedId === node.id;

  if (!hasChildren) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          isActive={isSelected}
          onClick={() => onSelect(node.id)}
          tooltip={node.title}
        >
          <span>{node.icon || "📄"}</span>
          <span>{node.title}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <Collapsible defaultOpen={isSelected || node.children.some(c => c.id === selectedId)} className="group/collapsible">
      <SidebarMenuItem>
        <SidebarMenuButton
          isActive={isSelected}
          onClick={() => onSelect(node.id)}
          tooltip={node.title}
        >
          <span>{node.icon || "📄"}</span>
          <span>{node.title}</span>
        </SidebarMenuButton>
        <CollapsibleTrigger asChild>
          <SidebarMenuAction
            className="left-2 bg-transparent hover:bg-sidebar-accent data-[state=open]:rotate-90 group-data-[collapsible=icon]:hidden"
            showOnHover={false}
          >
            <ChevronRight />
            <span className="sr-only">Aç/Kapat</span>
          </SidebarMenuAction>
        </CollapsibleTrigger>
        <CollapsibleContent className="group-data-[collapsible=icon]:hidden">
          <SidebarMenuSub>
            {node.children.map((child) => (
              <TreeSubItem
                key={child.id}
                node={child}
                selectedId={selectedId}
                onSelect={onSelect}
              />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

function TreeSubItem({
  node,
  selectedId,
  onSelect,
}: {
  node: PageTreeNode;
  selectedId: number | null;
  onSelect: (id: number) => void;
}) {
  const hasChildren = node.children.length > 0;
  const isSelected = selectedId === node.id;

  if (!hasChildren) {
    return (
      <SidebarMenuSubItem>
        <SidebarMenuSubButton
          isActive={isSelected}
          onClick={() => onSelect(node.id)}
        >
          <span>{node.icon || "📄"}</span>
          <span>{node.title}</span>
        </SidebarMenuSubButton>
      </SidebarMenuSubItem>
    );
  }

  return (
    <Collapsible defaultOpen={isSelected || node.children.some(c => c.id === selectedId)} className="group/sub-collapsible">
      <SidebarMenuSubItem>
        <SidebarMenuSubButton
          isActive={isSelected}
          onClick={() => onSelect(node.id)}
        >
          <span>{node.icon || "📄"}</span>
          <span>{node.title}</span>
        </SidebarMenuSubButton>
        <CollapsibleTrigger asChild>
          <button className="absolute left-1 top-1.5 h-5 w-5 rounded-md flex items-center justify-center hover:bg-sidebar-accent text-sidebar-foreground/50 transition-transform data-[state=open]:rotate-90">
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="pl-3 mt-1 border-l ml-3 border-sidebar-border">
            {node.children.map((child) => (
              <TreeSubItem
                key={child.id}
                node={child}
                selectedId={selectedId}
                onSelect={onSelect}
              />
            ))}
          </div>
        </CollapsibleContent>
      </SidebarMenuSubItem>
    </Collapsible>
  );
}
