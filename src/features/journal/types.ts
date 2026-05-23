export type EditablePhoto = {
  id: string
  imageUrl: string
  userDescription: string
  caption: string
}

export type EditableNote = {
  id: string
  scheduleStopId: string
  day: string
  time: string
  title: string
  body: string
  photos: EditablePhoto[]
  sortOrder: number
}
