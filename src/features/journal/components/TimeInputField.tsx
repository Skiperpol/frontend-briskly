import { getCurrentTimeValue } from "@/features/journal/journalUtils"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"

type TimeInputFieldProps = {
  id: string
  label?: string
  value: string
  onChange: (value: string) => void
}

export function TimeInputField({
  id,
  label = "Godzina",
  value,
  onChange,
}: TimeInputFieldProps) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-stretch gap-2">
        <Input
          id={id}
          type="time"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 min-w-0 flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="default"
          className="h-9 shrink-0 whitespace-nowrap px-3"
          onClick={() => onChange(getCurrentTimeValue())}
        >
          Aktualna godzina
        </Button>
      </div>
    </div>
  )
}
