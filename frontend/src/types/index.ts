// ──────────────────────────────────────────────
// User
// ──────────────────────────────────────────────

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  date_joined: string;
  avatar: string | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  password_confirm: string;
}

// ──────────────────────────────────────────────
// Page
// ──────────────────────────────────────────────

export interface Page {
  id: number;
  parent: number | null;
  title: string;
  icon: string;
  cover: string | null;
  position: number;
  children_count: number;
  blocks_count: number;
  created_at: string;
  updated_at: string;
}

export interface PageDetail extends Omit<Page, "children_count" | "blocks_count"> {
  blocks: Block[];
  children: Page[];
}

export interface PageTreeNode {
  id: number;
  parent: number | null;
  title: string;
  icon: string;
  position: number;
  children: PageTreeNode[];
}

export interface PageCreatePayload {
  title?: string;
  icon?: string;
  parent?: number | null;
}

export interface PageUpdatePayload {
  title?: string;
  icon?: string;
  cover?: string | null;
  position?: number;
}

// ──────────────────────────────────────────────
// Block
// ──────────────────────────────────────────────

export type BlockType =
  | "text"
  | "heading"
  | "checklist"
  | "progress"
  | "number"
  | "chart"
  | "table"
  | "image";

export interface Block {
  id: number;
  page: number;
  type: BlockType;
  data: Record<string, unknown>;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface BlockCreatePayload {
  type: BlockType;
  data: Record<string, unknown>;
  position?: number;
}

export interface BlockUpdatePayload {
  type?: BlockType;
  data?: Record<string, unknown>;
  position?: number;
}

// ──────────────────────────────────────────────
// Block Data Types
// ──────────────────────────────────────────────

export interface TextBlockData {
  content: string;
}

export interface HeadingBlockData {
  content: string;
  level: 1 | 2 | 3;
}

export interface ChecklistItem {
  text: string;
  completed: boolean;
}

export interface ChecklistBlockData {
  items: ChecklistItem[];
}

export interface ProgressBlockData {
  title: string;
  value: number;
  max: number;
}

export interface NumberBlockData {
  title: string;
  value: number;
  unit: string;
}

export interface ChartDataPoint {
  label: string;
  [series: string]: number | string;
}

export interface ChartBlockData {
  chartType: "line" | "bar" | "pie" | "donut" | "area";
  title: string;
  xAxis?: string;
  yAxis?: string;
  data: ChartDataPoint[];
}

export interface TableBlockData {
  hasColumnHeader?: boolean;
  hasRowHeader?: boolean;
  cells: string[][];
}

export interface ImageBlockData {
  url: string;
  caption?: string;
}
