"use client";

import { useRef, useState } from "react";
import { X, ImagePlus, Camera } from "lucide-react";

export function ImageUploader({
  images,
  onUpload,
  onRemove,
  maxImages = 5,
}: {
  images: string[];
  onUpload: (files: FileList) => void;
  onRemove: (index: number) => void;
  maxImages?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      if (replaceIndex !== null) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          onRemove(replaceIndex);
          onUpload(e.target.files!);
          setReplaceIndex(null);
        };
        reader.readAsDataURL(file);
      } else {
        onUpload(e.target.files);
      }
    }
    if (inputRef.current) inputRef.current.value = "";
    setReplaceIndex(null);
  };

  const handleClickReplace = (index: number) => {
    setReplaceIndex(index);
    inputRef.current?.click();
  };

  const handleClickAdd = () => {
    setReplaceIndex(null);
    inputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {images.map((img, i) => (
          <div
            key={i}
            className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors cursor-pointer ring-1 ${
              dragOverIndex === i
                ? "border-maroon dark:border-gold ring-maroon/20 dark:ring-gold/20"
                : "border-border ring-black/[0.03] dark:ring-white/[0.03]"
            }`}
            onClick={() => handleClickReplace(i)}
          >
            <img
              src={img}
              alt={`Product ${i + 1}`}
              className="w-full h-full object-cover"
            />
            {/* Hover overlay — "Change" */}
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <Camera className="w-4 h-4 text-white mb-0.5" />
              <span className="text-[9px] text-white font-medium">Change</span>
            </div>
            {/* Remove button — top right */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(i);
              }}
              className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-black/50 hover:bg-red-500 transition-colors cursor-pointer ring-1 ring-white/20"
            >
              <X className="w-2.5 h-2.5 text-white" />
            </button>
            {/* Main image indicator */}
            {i === 0 && (
              <div className="absolute bottom-0 left-0 right-0 bg-maroon/80 dark:bg-gold/80 text-center py-0.5">
                <span className="text-[8px] text-white dark:text-dark-bg font-medium">Main</span>
              </div>
            )}
          </div>
        ))}
        {images.length < maxImages && (
          <button
            onClick={handleClickAdd}
            className="w-20 h-20 rounded-lg border-2 border-dashed border-border ring-1 ring-black/[0.02] dark:ring-white/[0.02] flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-maroon dark:hover:border-gold hover:text-maroon dark:hover:text-gold hover:ring-maroon/10 dark:hover:ring-gold/10 transition-all cursor-pointer"
          >
            <ImagePlus className="w-5 h-5" />
            <span className="text-[10px] font-medium">Upload</span>
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple={replaceIndex === null} onChange={handleFiles} className="hidden" />
      <p className="text-[10px] text-muted-foreground">{images.length}/{maxImages} images. First image is the main display. Click an image to replace it.</p>
    </div>
  );
}