"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, UploadCloud, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export function PortfolioUploader({
  initialImages,
  onImagesChange,
}: {
  initialImages: string[];
  onImagesChange: (images: string[]) => void;
}) {
  const [images, setImages] = useState(initialImages);
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function updateImages(nextImages: string[]) {
    setImages(nextImages);
    onImagesChange(nextImages);
  }

  async function handleFiles(files: FileList | null) {
    if (!files?.length) {
      return;
    }

    setIsUploading(true);
    setMessage("");

    if (!isSupabaseConfigured()) {
      const demoImages = Array.from(files).map((file) => `demo-upload/${file.name}`);
      updateImages([...images, ...demoImages]);
      setMessage("Added in demo mode. Connect Supabase to upload into the portfolio bucket.");
      setIsUploading(false);
      return;
    }

    const supabase = createClient();
    const uploadedPaths: string[] = [];

    for (const file of Array.from(files)) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase();
      const path = `portfolio/${crypto.randomUUID()}-${safeName}`;
      const { error } = await supabase.storage.from("portfolio").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });

      if (error) {
        setMessage(error.message);
        setIsUploading(false);
        return;
      }

      uploadedPaths.push(path);
    }

    updateImages([...images, ...uploadedPaths]);
    setMessage("Portfolio images uploaded.");
    setIsUploading(false);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {images.map((image) => (
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-surface-soft ring-1 ring-line" key={image}>
            {image.startsWith("http") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt="" className="h-full w-full object-cover" src={image} />
            ) : (
              <div className="grid h-full place-items-center px-3 text-center text-xs font-semibold text-stone-500">
                {image.replace("demo-upload/", "")}
              </div>
            )}
            <button
              className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-white/90 text-stone-700 shadow-sm"
              onClick={() => updateImages(images.filter((item) => item !== image))}
              type="button"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
        <button
          className="grid aspect-square place-items-center rounded-2xl border border-dashed border-stone-300 bg-white text-stone-500 transition hover:border-brand hover:text-brand"
          onClick={() => inputRef.current?.click()}
          type="button"
        >
          <ImagePlus className="size-6" />
        </button>
      </div>

      <input
        accept="image/*"
        className="hidden"
        multiple
        onChange={(event) => handleFiles(event.target.files)}
        ref={inputRef}
        type="file"
      />

      <div className="flex flex-wrap items-center gap-3">
        <Button disabled={isUploading} onClick={() => inputRef.current?.click()} size="sm" type="button" variant="secondary">
          {isUploading ? <Loader2 className="size-4 animate-spin" /> : <UploadCloud className="size-4" />}
          {isUploading ? "Uploading..." : "Upload images"}
        </Button>
        {message ? <p className="text-sm font-medium text-stone-600">{message}</p> : null}
      </div>
    </div>
  );
}
