import { ImagePlus, X } from "lucide-react"

import type { EditablePhoto } from "@/features/journal/types"
import { Button } from "@/shared/components/ui/button"
import { Label } from "@/shared/components/ui/label"
import { cn } from "@/shared/lib/utils"

type NotePhotoFieldsProps = {
  photos: EditablePhoto[]
  onChange: (photos: EditablePhoto[]) => void
}

export function NotePhotoFields({ photos, onChange }: NotePhotoFieldsProps) {
  const handleFiles = (files: FileList | null) => {
    if (!files?.length) return
    const added = Array.from(files).map((file) => ({
      id: `ph-${crypto.randomUUID()}`,
      imageUrl: URL.createObjectURL(file),
      userDescription: "",
      caption: file.name,
    }))
    onChange([...photos, ...added])
  }

  const updateDescription = (id: string, userDescription: string) => {
    onChange(
      photos.map((photo) =>
        photo.id === id ? { ...photo, userDescription } : photo,
      ),
    )
  }

  const removePhoto = (id: string) => {
    const removed = photos.find((p) => p.id === id)
    if (removed?.imageUrl.startsWith("blob:")) {
      URL.revokeObjectURL(removed.imageUrl)
    }
    onChange(photos.filter((photo) => photo.id !== id))
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Zdjęcia</Label>
        <Button type="button" variant="outline" size="sm" className="gap-1.5" asChild>
          <label className="cursor-pointer">
            <ImagePlus className="size-4" />
            Dodaj zdjęcie
            <input
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(e) => {
                handleFiles(e.target.files)
                e.target.value = ""
              }}
            />
          </label>
        </Button>
      </div>
      {photos.length === 0 ? (
        <p className="text-xs text-muted-foreground">Brak zdjęć</p>
      ) : (
        <ul className="space-y-3">
          {photos.map((photo) => (
            <li
              key={photo.id}
              className="flex items-stretch gap-3 rounded-lg border border-border p-2"
            >
              <img
                src={photo.imageUrl}
                alt=""
                className="size-16 shrink-0 rounded-md object-cover"
              />
              <textarea
                placeholder="Krótki opis zdjęcia…"
                value={photo.userDescription}
                onChange={(e) => updateDescription(photo.id, e.target.value)}
                className={cn(
                  "h-16 w-full min-w-0 flex-1 resize-none rounded-md border border-input bg-transparent px-2.5 py-2 text-xs outline-none",
                  "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50",
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="shrink-0 self-center"
                aria-label="Usuń zdjęcie"
                onClick={() => removePhoto(photo.id)}
              >
                <X className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
