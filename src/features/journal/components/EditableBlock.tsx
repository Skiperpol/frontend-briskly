import { useState, type ReactNode } from "react"
import { Pencil, Trash2 } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"

type EditableBlockProps = {
  children: ReactNode
  editContent: ReactNode
  onSave: () => void
  onCancel: () => void
  onDelete?: () => void
  className?: string
}

export function EditableBlock({
  children,
  editContent,
  onSave,
  onCancel,
  onDelete,
  className,
}: EditableBlockProps) {
  const [editing, setEditing] = useState(false)

  const handleSave = () => {
    onSave()
    setEditing(false)
  }

  const handleCancel = () => {
    onCancel()
    setEditing(false)
  }

  if (editing) {
    return (
      <div className={cn("space-y-3 rounded-lg border border-border bg-muted/30 p-4", className)}>
        {editContent}
        <div className="flex gap-2">
          <Button type="button" size="sm" onClick={handleSave}>
            Zapisz
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={handleCancel}>
            Anuluj
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("group relative", className)}>
      {children}
      <div className="absolute inset-y-4 right-4 flex w-36 flex-col justify-center gap-2 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full justify-center gap-1.5"
          onClick={() => setEditing(true)}
        >
          <Pencil className="size-3.5 shrink-0" />
          Edytuj
        </Button>
        {onDelete && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full justify-center gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="size-3.5 shrink-0" />
            Usuń notatkę
          </Button>
        )}
      </div>
    </div>
  )
}
