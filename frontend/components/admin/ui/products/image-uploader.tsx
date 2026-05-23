"use client";

import { useRef } from "react";
import { X, ImagePlus } from "lucide-react";

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

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) onUpload(e.target.files);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {images.map((img, i) => (
          <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border group">
            <img
              src={img}
              alt={`Product ${i + 1}`}
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => onRemove(i)}
              className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        ))}
        {images.length < maxImages && (
          <button
            onClick={() => inputRef.current?.click()}
            className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-maroon dark:hover:border-gold hover:text-maroon dark:hover:text-gold transition-colors cursor-pointer"
          >
            <ImagePlus className="w-5 h-5" />
            <span className="text-[10px] font-medium">Upload</span>
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
      <p className="text-[10px] text-muted-foreground">{images.length}/{maxImages} images. First image is the main display image.</p>
    </div>
  );
}