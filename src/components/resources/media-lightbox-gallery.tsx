"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

export function MediaLightboxGallery({ images }: { images: string[] }) {
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4">
        {images.map((src, i) => (
          <button
            key={src + i}
            type="button"
            onClick={() => setPreview(src)}
            className="group relative aspect-square rounded-2xl overflow-hidden shadow-sm cursor-zoom-in"
          >
            <Image
              src={src}
              alt=""
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </button>
        ))}
      </div>

      {preview && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setPreview(null)}
        >
          <button
            onClick={() => setPreview(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            aria-label="Fermer l'aperçu"
          >
            <X size={22} />
          </button>
          <img
            src={preview}
            alt=""
            className="max-h-[85vh] max-w-4xl w-full rounded-lg object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
