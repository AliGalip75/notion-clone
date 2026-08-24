import React, { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Image as ImageIcon, Upload, Link } from "lucide-react";
import { pagesApi } from "@/api/pages";
import type { Block, ImageBlockData } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ImageBlockProps {
  block: Block;
}

export default function ImageBlock({ block }: ImageBlockProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const data = block.data as unknown as ImageBlockData;
  const [embedUrl, setEmbedUrl] = useState("");
  const [showEmbedInput, setShowEmbedInput] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const updateBlock = useMutation({
    mutationFn: (newData: Partial<ImageBlockData>) =>
      pagesApi.updateBlock(block.id, {
        type: "image",
        data: { ...data, ...newData },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["page", block.page] });
    },
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => pagesApi.uploadFile(file),
    onSuccess: (res) => {
      updateBlock.mutate({ url: res.data.url });
    },
    onError: (error) => {
      console.error("Görsel yüklenirken hata:", error);
      alert("Görsel yüklenirken bir hata oluştu.");
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  const handleEmbedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (embedUrl.trim()) {
      updateBlock.mutate({ url: embedUrl.trim() });
      setShowEmbedInput(false);
    }
  };

  const handleCaptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateBlock.mutate({ caption: e.target.value });
  };

  if (data.url) {
    return (
      <div 
        className="w-full relative group py-2"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <img 
          src={data.url} 
          alt={data.caption || "Görsel"} 
          className="max-w-full rounded-md object-contain max-h-[80vh]"
        />
        
        {/* Caption Input */}
        <div className="mt-2 text-center">
          <input
            type="text"
            value={data.caption || ""}
            onChange={handleCaptionChange}
            placeholder="Bir başlık ekle..."
            className={`bg-transparent text-sm text-[var(--color-text-secondary)] text-center outline-none w-full max-w-md ${
              !data.caption && !isHovering ? "opacity-0" : "opacity-100"
            } transition-opacity placeholder-[var(--color-text-tertiary)]`}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full my-2">
      {!showEmbedInput ? (
        <Card className="border-dashed border-[1.5px] shadow-sm hover:bg-muted/30 transition-colors">
          <CardContent className="flex flex-col items-center justify-center py-8 px-4 space-y-4">
            <div className="p-3 bg-secondary rounded-full text-muted-foreground">
              <ImageIcon className="size-6" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-medium">Görsel Ekle</p>
              <p className="text-xs text-muted-foreground">
                Bilgisayarınızdan yükleyin veya bir bağlantı kullanın
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <Button 
                variant="secondary" 
                size="sm"
                disabled={uploadMutation.isPending}
                onClick={() => fileInputRef.current?.click()}
                className="gap-2 cursor-pointer"
              >
                <Upload className="size-4" />
                {uploadMutation.isPending ? "Yükleniyor..." : "Bilgisayardan Yükle"}
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowEmbedInput(true)}
                className="gap-2 text-muted-foreground cursor-pointer"
              >
                <Link className="size-4" />
                Bağlantı Ekle
              </Button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="border shadow-sm">
          <CardContent className="flex flex-col py-5 px-4 space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Link className="size-4" />
              <span>Görsel Bağlantısı</span>
            </div>
            <form onSubmit={handleEmbedSubmit} className="flex gap-2">
              <Input
                type="url"
                value={embedUrl}
                onChange={(e) => setEmbedUrl(e.target.value)}
                placeholder="Görselin adresini yapıştırın..."
                className="flex-1"
                autoFocus
              />
              <Button type="submit" disabled={!embedUrl.trim()} size="sm" className="h-9 cursor-pointer">
                Ekle
              </Button>
            </form>
            <div className="text-left">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowEmbedInput(false)}
                className="text-xs text-muted-foreground h-auto p-0 hover:bg-transparent hover:underline cursor-pointer"
              >
                İptal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
