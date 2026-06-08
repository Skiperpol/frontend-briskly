export type EditablePhoto = {
  id: string
  imageUrl: string
  userDescription: string
  caption: string
  file?: File
}

export type EditableNote = {
  id: string
  connectionId: number
  scheduleStopId: string
  day: string
  time: string
  title: string
  body: string
  photos: EditablePhoto[]
  sortOrder: number
  isImageOnly?: boolean
}
