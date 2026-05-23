import { useState, type ReactNode } from "react"
import { Pencil } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"

type EditableBlockProps = {
  children: ReactNode
  editContent: ReactNode
  onSave: () => void
  onCancel: () => void
  className?: string
}

export function EditableBlock({
  children,
  editContent,
  onSave,
  onCancel,
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
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="absolute top-4 right-4 gap-1.5 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
        onClick={() => setEditing(true)}
      >
        <Pencil className="size-3.5" />
        Edytuj
      </Button>
    </div>
  )
}
