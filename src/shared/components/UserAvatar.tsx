import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar"
import { cn } from "@/shared/lib/utils"

type UserAvatarProps = {
  initials: string
  className?: string
  fallbackClassName?: string
}

export function UserAvatar({ initials, className, fallbackClassName }: UserAvatarProps) {
  const twoLetters = initials.slice(0, 2).toUpperCase()

  return (
    <Avatar className={cn("bg-blue-600", className)}>
      <AvatarFallback
        className={cn(
          "bg-blue-600 text-sm font-semibold text-white",
          fallbackClassName,
        )}
      >
        {twoLetters}
      </AvatarFallback>
    </Avatar>
  )
}
