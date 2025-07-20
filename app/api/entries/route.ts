import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"
import type { DiaryEntry } from "@/types/diary"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const search = searchParams.get("search")
  const tags = searchParams.get("tags")?.split(",").filter(Boolean)
  const hasImage = searchParams.get("hasImage") === "true"

  try {
    const client = await clientPromise
    const db = client.db("personal-diary")

    const query: any = { userId: session.user.id }

    if (search) {
      query.content = { $regex: search, $options: "i" }
    }

    if (tags && tags.length > 0) {
      query.tags = { $in: tags }
    }

    if (hasImage) {
      query.imageUrl = { $exists: true, $ne: null }
    }

    const entries = await db.collection("entries").find(query).sort({ date: -1 }).toArray()

    return NextResponse.json(entries)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch entries" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { content, tags, imageUrl } = body

    const today = new Date().toISOString().split("T")[0]

    const client = await clientPromise
    const db = client.db("personal-diary")

    // Check if entry already exists for today
    const existingEntry = await db.collection("entries").findOne({
      userId: session.user.id,
      date: today,
    })

    if (existingEntry) {
      return NextResponse.json({ error: "Entry already exists for today" }, { status: 400 })
    }

    const entry: DiaryEntry = {
      userId: session.user.id,
      date: today,
      content,
      tags: tags || [],
      imageUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("entries").insertOne(entry)

    return NextResponse.json({ ...entry, _id: result.insertedId })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create entry" }, { status: 500 })
  }
}
