import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"
import type { UserStats } from "@/types/diary"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const client = await clientPromise
    const db = client.db("personal-diary")

    const entries = await db.collection("entries").find({ userId: session.user.id }).sort({ date: 1 }).toArray()

    // Calculate total entries
    const totalEntries = entries.length

    // Calculate streaks (simplified)
    let currentStreak = 0
    let longestStreak = 0

    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)

    // Check if user wrote today or yesterday for current streak
    const todayStr = today.toISOString().split("T")[0]
    const yesterdayStr = yesterday.toISOString().split("T")[0]

    const hasToday = entries.some((entry) => entry.date === todayStr)
    const hasYesterday = entries.some((entry) => entry.date === yesterdayStr)

    if (hasToday || hasYesterday) {
      currentStreak = 1
      // Simple streak calculation - in production, implement proper consecutive day logic
      longestStreak = Math.max(1, Math.floor(totalEntries / 3))
    }

    // Calculate entries per day for last 30 days
    const entriesPerDay = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]
      const count = entries.filter((entry) => entry.date === dateStr).length
      entriesPerDay.push({ date: dateStr, count })
    }

    // Calculate tag frequency
    const tagCounts: { [key: string]: number } = {}
    entries.forEach((entry) => {
      if (entry.tags && Array.isArray(entry.tags)) {
        entry.tags.forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1
        })
      }
    })

    const tagFrequency = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)

    const stats: UserStats = {
      totalEntries,
      currentStreak,
      longestStreak,
      entriesPerDay,
      tagFrequency,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Stats API error:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
