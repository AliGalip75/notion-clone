import client from "./client";
import type {
  Block,
  BlockCreatePayload,
  BlockUpdatePayload,
  Page,
  PageCreatePayload,
  PageDetail,
  PageTreeNode,
  PageUpdatePayload,
} from "@/types";

export const pagesApi = {
  // ── Pages ──────────────────────────────────

  list() {
    return client.get<Page[]>("/core/pages/");
  },

  tree() {
    return client.get<PageTreeNode[]>("/core/pages/tree/");
  },

  get(id: number) {
    return client.get<PageDetail>(`/core/pages/${id}/`);
  },

  create(data: PageCreatePayload) {
    return client.post<Page>("/core/pages/", data);
  },

  update(id: number, data: PageUpdatePayload) {
    return client.patch<Page>(`/core/pages/${id}/`, data);
  },

  delete(id: number) {
    return client.delete(`/core/pages/${id}/`);
  },

  children(id: number) {
    return client.get<Page[]>(`/core/pages/${id}/children/`);
  },

  // ── Blocks ─────────────────────────────────

  listBlocks(pageId: number) {
    return client.get<Block[]>(`/core/pages/${pageId}/blocks/`);
  },

  createBlock(pageId: number, data: BlockCreatePayload) {
    return client.post<Block>(`/core/pages/${pageId}/blocks/`, data);
  },

  updateBlock(blockId: number, data: BlockUpdatePayload) {
    return client.patch<Block>(`/core/blocks/${blockId}/`, data);
  },

  deleteBlock(blockId: number) {
    return client.delete(`/core/blocks/${blockId}/`);
  },

  reorderContent(pageId: number, items: { type: "block" | "page"; id: number }[]) {
    return client.patch(`/core/pages/${pageId}/reorder-content/`, { items });
  },

  // ── Upload ─────────────────────────────────

  uploadFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return client.post<{ url: string }>("/core/upload/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};
