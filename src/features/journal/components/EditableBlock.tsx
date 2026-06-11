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
    <div
      className={cn(
        "group flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0 flex-1">{children}</div>
      <div
        className={cn(
          "flex shrink-0 flex-wrap gap-2",
          "sm:flex-col sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:group-focus-within:opacity-100",
        )}
      >
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5"
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
            className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="size-3.5 shrink-0" />
            <span className="sm:hidden">Usuń</span>
            <span className="hidden sm:inline">Usuń notatkę</span>
          </Button>
        )}
      </div>
    </div>
  )
}
