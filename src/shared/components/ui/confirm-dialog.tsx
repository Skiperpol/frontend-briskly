import { Loader2 } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"

type ConfirmDialogProps = {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  loading?: boolean
  loadingDescription?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Potwierdź",
  cancelLabel = "Anuluj",
  loading = false,
  loadingDescription = "Proszę czekać…",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null

  const handleBackdropMouseDown = () => {
    if (!loading) onCancel()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
      onMouseDown={handleBackdropMouseDown}
    >
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" aria-hidden />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-busy={loading}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        className={cn(
          "relative z-10 w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg",
        )}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2 id="confirm-dialog-title" className="text-lg font-semibold">
          {title}
        </h2>
        <p id="confirm-dialog-description" className="mt-2 text-sm text-muted-foreground">
          {description}
        </p>
        {loading && (
          <div
            className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-sm text-muted-foreground"
            aria-live="polite"
          >
            <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
            <span>{loadingDescription}</span>
          </div>
        )}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" disabled={loading} onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button type="button" disabled={loading} onClick={onConfirm}>
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                {confirmLabel}
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
