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
  MoreHorizontal,
  Trash2,
  Edit2,
  Check,
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
import { Input } from "@/components/ui/input";

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
  const [autoRenameId, setAutoRenameId] = useState<number | null>(null);

  const { data: tree = [] } = useQuery({
    queryKey: ["pageTree"],
    queryFn: () => pagesApi.tree().then((r) => r.data),
  });

  const createPage = useMutation({
    mutationFn: () => pagesApi.create({ title: "Yeni Sayfa", icon: "" }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["pageTree"] });
      onSelectPage(res.data.id);
      setAutoRenameId(res.data.id);
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
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg overflow-hidden">
                <img
                  src={isDark ? "/logo-dark.png" : "/logo-light.png"}
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
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
          <SidebarGroupAction onClick={() => createPage.mutate()} className="px-3 hover:bg-black/5 hover:cursor-pointer dark:hover:bg-sidebar-accent">
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
                    autoRenameId={autoRenameId}
                    onSetAutoRenameId={setAutoRenameId}
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
                  <ChevronsUpDown className="ml-auto size-4 hover:cursor-pointer" />
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
                <DropdownMenuItem onClick={handleLogout} className="group focus:text-red-600 dark:focus:text-red-500">
                  <LogOut className="mr-2 size-4 text-muted-foreground group-focus:text-red-600 dark:group-focus:text-red-500" />
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
  autoRenameId,
  onSetAutoRenameId,
}: {
  node: PageTreeNode;
  selectedId: number | null;
  onSelect: (id: number) => void;
  autoRenameId: number | null;
  onSetAutoRenameId: (id: number | null) => void;
}) {
  const hasChildren = node.children.length > 0;
  const isSelected = selectedId === node.id;
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [isRenaming, setIsRenaming] = useState(autoRenameId === node.id);

  useEffect(() => {
    if (autoRenameId === node.id) {
      setIsRenaming(true);
      onSetAutoRenameId(null);
    }
  }, [autoRenameId, node.id, onSetAutoRenameId]);

  const [title, setTitle] = useState(node.title);

  const deleteMutation = useMutation({
    mutationFn: () => pagesApi.delete(node.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pageTree"] });
      queryClient.invalidateQueries({ queryKey: ["page"] });
      if (selectedId === node.id) {
        navigate("/");
      }
    }
  });

  const updateMutation = useMutation({
    mutationFn: (newTitle: string) => pagesApi.update(node.id, { title: newTitle }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pageTree"] });
      queryClient.invalidateQueries({ queryKey: ["page"] });
      setIsRenaming(false);
    }
  });

  const handleRename = () => {
    if (title.trim() && title !== node.title) {
      updateMutation.mutate(title);
    } else {
      setIsRenaming(false);
      setTitle(node.title);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.stopPropagation();
      handleRename();
    }
    if (e.key === 'Escape') {
      setIsRenaming(false);
      setTitle(node.title);
    }
  };

  const createSubPageMutation = useMutation({
    mutationFn: () => pagesApi.create({ title: "Yeni Sayfa", icon: "", parent: node.id }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["pageTree"] });
      onSelect(res.data.id);
      onSetAutoRenameId(res.data.id);
    },
  });

  const ActionsMenu = () => (
    <>
      <SidebarMenuAction
        showOnHover={true}
        className="right-7 bg-transparent hover:bg-sidebar-accent z-10"
        onClick={(e) => {
          e.stopPropagation();
          createSubPageMutation.mutate();
        }}
      >
        <Plus className="hover:bg-black/5 dark:hover:bg-white/5 hover:cursor-pointer" />
        <span className="sr-only">Alt sayfa ekle</span>
      </SidebarMenuAction>
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <SidebarMenuAction
            showOnHover={true}
            className="bg-transparent hover:bg-sidebar-accent z-10"
          >
            <MoreHorizontal className="hover:bg-black/5 dark:hover:bg-white/5 hover:cursor-pointer" />
            <span className="sr-only">Daha fazla</span>
          </SidebarMenuAction>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start">
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setIsRenaming(true); }}>
            <Edit2 className="mr-2 size-4" />
            Yeniden Adlandır
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(); }}
            className="group focus:text-red-600 dark:focus:text-red-500"
          >
            <Trash2 className="mr-2 size-4 text-muted-foreground group-focus:text-red-600 dark:group-focus:text-red-500" />
            Sil
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );

  const TitleContent = () => (
    isRenaming ? (
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={handleRename}
        onKeyDown={handleKeyDown}
        autoFocus
        className="h-6 py-0 px-1 text-sm bg-background"
        onClick={(e) => e.stopPropagation()}
      />
    ) : (
      <span className="truncate">{node.title}</span>
    )
  );

  if (!hasChildren) {
    return (
      <SidebarMenuItem className="relative group/item">
        <SidebarMenuButton
          isActive={isSelected}
          onClick={() => onSelect(node.id)}
          tooltip={node.title}
          className={!isRenaming ? "group-hover/item:pr-14 transition-[padding]" : "transition-[padding]"}
        >
          <span>
            {node.icon && node.icon !== "📄" ? node.icon : <FileText className="size-4 shrink-0" />}
          </span>
          <TitleContent />
        </SidebarMenuButton>
        {!isRenaming && <ActionsMenu />}
      </SidebarMenuItem>
    );
  }

  return (
    <Collapsible defaultOpen={isSelected || node.children.some(c => c.id === selectedId)} className="group/collapsible">
      <SidebarMenuItem className="relative group/item">
        <SidebarMenuButton
          isActive={isSelected}
          onClick={() => onSelect(node.id)}
          tooltip={node.title}
          className={!isRenaming ? "group-hover/item:pr-14 transition-[padding]" : "transition-[padding]"}
        >
          <span className="group-hover/item:opacity-0 transition-opacity">
            {node.icon && node.icon !== "📄" ? node.icon : <FileText className="size-4 shrink-0" />}
          </span>
          <TitleContent />
        </SidebarMenuButton>
        <CollapsibleTrigger asChild>
          <SidebarMenuAction
            className="left-1 opacity-0 group-hover/item:opacity-100 transition-all data-[state=open]:rotate-90 group-data-[collapsible=icon]:hidden bg-transparent hover:bg-sidebar-accent"
            showOnHover={false}
          >
            <ChevronRight className="hover:bg-black/5 dark:hover:bg-white/5 hover:cursor-pointer" />
            <span className="sr-only">Aç/Kapat</span>
          </SidebarMenuAction>
        </CollapsibleTrigger>
        {!isRenaming && <ActionsMenu />}
        <CollapsibleContent className="group-data-[collapsible=icon]:hidden">
          <SidebarMenuSub>
            {node.children.map((child) => (
              <TreeSubItem
                key={child.id}
                node={child}
                selectedId={selectedId}
                onSelect={onSelect}
                autoRenameId={autoRenameId}
                onSetAutoRenameId={onSetAutoRenameId}
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
  autoRenameId,
  onSetAutoRenameId,
  depth = 1,
}: {
  node: PageTreeNode;
  selectedId: number | null;
  onSelect: (id: number) => void;
  autoRenameId: number | null;
  onSetAutoRenameId: (id: number | null) => void;
  depth?: number;
}) {
  const hasChildren = node.children.length > 0;
  const isSelected = selectedId === node.id;
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [isRenaming, setIsRenaming] = useState(autoRenameId === node.id);

  useEffect(() => {
    if (autoRenameId === node.id) {
      setIsRenaming(true);
      onSetAutoRenameId(null);
    }
  }, [autoRenameId, node.id, onSetAutoRenameId]);

  const [title, setTitle] = useState(node.title);

  const deleteMutation = useMutation({
    mutationFn: () => pagesApi.delete(node.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pageTree"] });
      queryClient.invalidateQueries({ queryKey: ["page"] });
      if (selectedId === node.id) {
        navigate("/");
      }
    }
  });

  const updateMutation = useMutation({
    mutationFn: (newTitle: string) => pagesApi.update(node.id, { title: newTitle }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pageTree"] });
      queryClient.invalidateQueries({ queryKey: ["page"] });
      setIsRenaming(false);
    }
  });

  const handleRename = () => {
    if (title.trim() && title !== node.title) {
      updateMutation.mutate(title);
    } else {
      setIsRenaming(false);
      setTitle(node.title);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.stopPropagation();
      handleRename();
    }
    if (e.key === 'Escape') {
      setIsRenaming(false);
      setTitle(node.title);
    }
  };

  const createSubPageMutation = useMutation({
    mutationFn: () => pagesApi.create({ title: "Yeni Sayfa", icon: "", parent: node.id }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["pageTree"] });
      onSelect(res.data.id);
      onSetAutoRenameId(res.data.id);
    },
  });

  const ActionsMenu = () => (
    <>
      {depth < 3 && (
        <SidebarMenuAction
          showOnHover={true}
          className="right-7 bg-transparent hover:bg-sidebar-accent z-10"
          onClick={(e) => {
            e.stopPropagation();
            createSubPageMutation.mutate();
          }}
        >
          <Plus className="hover:bg-black/5 dark:hover:bg-white/5 hover:cursor-pointer" />
          <span className="sr-only">Alt sayfa ekle</span>
        </SidebarMenuAction>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <SidebarMenuAction
            showOnHover={true}
            className={depth < 3 ? "bg-transparent hover:bg-sidebar-accent z-10" : "right-1 bg-transparent hover:bg-sidebar-accent z-10"}
          >
            <MoreHorizontal className="hover:bg-black/5 dark:hover:bg-white/5 hover:cursor-pointer" />
            <span className="sr-only">Daha fazla</span>
          </SidebarMenuAction>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start">
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setIsRenaming(true); }}>
            <Edit2 className="mr-2 size-4" />
            Yeniden Adlandır
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(); }}
            className="group focus:text-red-600 dark:focus:text-red-500"
          >
            <Trash2 className="mr-2 size-4 text-muted-foreground group-focus:text-red-600 dark:group-focus:text-red-500" />
            Sil
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );

  const TitleContent = () => (
    isRenaming ? (
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={handleRename}
        onKeyDown={handleKeyDown}
        autoFocus
        className="h-6 py-0 px-1 text-sm bg-background"
        onClick={(e) => e.stopPropagation()}
      />
    ) : (
      <span className="truncate">{node.title}</span>
    )
  );

  if (!hasChildren) {
    return (
      <SidebarMenuSubItem className="relative group/item">
        <SidebarMenuSubButton
          isActive={isSelected}
          onClick={() => onSelect(node.id)}
          className={!isRenaming ? "group-hover/item:pr-14 transition-[padding]" : ""}
          title={node.title}
        >
          <span>
            {node.icon && node.icon !== "📄" ? node.icon : <FileText className="size-4 shrink-0" />}
          </span>
          <TitleContent />
        </SidebarMenuSubButton>
        {!isRenaming && <ActionsMenu />}
      </SidebarMenuSubItem>
    );
  }

  return (
    <Collapsible defaultOpen={isSelected || node.children.some(c => c.id === selectedId)} className="group/sub-collapsible">
      <SidebarMenuSubItem className="relative group/item">
        <SidebarMenuSubButton
          isActive={isSelected}
          onClick={() => onSelect(node.id)}
          className={!isRenaming ? "group-hover/item:pr-14 transition-[padding]" : ""}
          title={node.title}
        >
          <span className="group-hover/item:opacity-0 transition-opacity">
            {node.icon && node.icon !== "📄" ? node.icon : <FileText className="size-4 shrink-0" />}
          </span>
          <TitleContent />
        </SidebarMenuSubButton>
        <CollapsibleTrigger asChild>
          <SidebarMenuAction
            className="left-0 opacity-0 group-hover/item:opacity-100 transition-all data-[state=open]:rotate-90 group-data-[collapsible=icon]:hidden bg-transparent hover:bg-sidebar-accent"
            showOnHover={false}
          >
            <ChevronRight className="hover:bg-black/5 dark:hover:bg-white/5 hover:cursor-pointer" />
            <span className="sr-only">Aç/Kapat</span>
          </SidebarMenuAction>
        </CollapsibleTrigger>
        {!isRenaming && <ActionsMenu />}
        <CollapsibleContent>
          <SidebarMenuSub>
            {node.children.map((child) => (
              <TreeSubItem
                key={child.id}
                node={child}
                selectedId={selectedId}
                onSelect={onSelect}
                autoRenameId={autoRenameId}
                onSetAutoRenameId={onSetAutoRenameId}
                depth={depth + 1}
              />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuSubItem>
    </Collapsible>
  );
}
