export interface DiaryEntry {
  _id?: string
  userId: string
  date: string
  content: string
  tags: string[]
  imageUrl?: string
  createdAt: Date
  updatedAt: Date
}

export interface UserStats {
  totalEntries: number
  currentStreak: number
  longestStreak: number
  entriesPerDay: { date: string; count: number }[]
  tagFrequency: { tag: string; count: number }[]
}
