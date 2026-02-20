"use client"

import { useRef, useState } from "react"
import { ImagePlus, X, GripVertical } from "lucide-react"

interface ImageUploadProps {
  images: string[]
  onImagesChange: (images: string[]) => void
}

export function ImageUpload({ images, onImagesChange }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  function handleFiles(files: FileList | null) {
    if (!files) return
    const newImages: string[] = []
    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file)
        newImages.push(url)
      }
    })
    onImagesChange([...images, ...newImages])
  }

  function removeImage(index: number) {
    const updated = images.filter((_, i) => i !== index)
    onImagesChange(updated)
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        className={`
          relative flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed 
          p-10 transition-all duration-300 cursor-pointer
          ${
            dragOver
              ? "border-primary bg-primary/5"
              : "border-border bg-secondary/30 hover:border-primary/50 hover:bg-secondary/60"
          }
        `}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          handleFiles(e.dataTransfer.files)
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click() }}
        aria-label="Upload aircraft images"
      >
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
          <ImagePlus className="size-6 text-primary" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="text-sm font-medium text-foreground">
            Drop images here or click to browse
          </p>
          <p className="text-xs text-muted-foreground">
            PNG, JPG up to 10MB each. First image will be the cover.
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((src, index) => (
            <div
              key={`${src}-${index}`}
              className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-secondary"
            >
              <img
                src={src}
                alt={`Aircraft image ${index + 1}`}
                className="size-full object-cover"
              />
              <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                <GripVertical className="size-4 text-muted-foreground" />
              </div>
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-destructive hover:text-destructive-foreground"
                aria-label={`Remove image ${index + 1}`}
              >
                <X className="size-3.5" />
              </button>
              {index === 0 && (
                <span className="absolute bottom-1.5 left-1.5 rounded-full bg-primary/90 px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
                  Cover
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
