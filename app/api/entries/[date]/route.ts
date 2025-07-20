import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"

export async function GET(request: NextRequest, { params }: { params: { date: string } }) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const client = await clientPromise
    const db = client.db("personal-diary")

    const entry = await db.collection("entries").findOne({
      userId: session.user.id,
      date: params.date,
    })

    if (!entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 })
    }

    return NextResponse.json(entry)
  } catch (error) {
    console.error("Get entry error:", error)
    return NextResponse.json({ error: "Failed to fetch entry" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { date: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const today = new Date().toISOString().split("T")[0]
  if (params.date !== today) {
    return NextResponse.json(
      { error: "Can only edit today's entry" },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const { content, tags } = body

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("personal-diary")

    const result = await db.collection("entries").findOneAndUpdate(
      {
        userId: session.user.id,
        date: params.date,
      },
      {
        $set: {
          content: content.trim(),
          tags: tags || [],
          updatedAt: new Date(),
        },
      },
      {
        returnDocument: "after",
      }
    )
    console.log(result)
    if (!result) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 })
    }
    return NextResponse.json(result)
  } catch (error) {
    console.error("Update entry error:", error)
    return NextResponse.json({ error: "Failed to update entry" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { date: string } }) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Only allow deleting today's entry
  const today = new Date().toISOString().split("T")[0]
  if (params.date !== today) {
    return NextResponse.json({ error: "Can only delete today's entry" }, { status: 403 })
  }

  try {
    const client = await clientPromise
    const db = client.db("personal-diary")

    const result = await db.collection("entries").deleteOne({
      userId: session.user.id,
      date: params.date,
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Entry deleted successfully" })
  } catch (error) {
    console.error("Delete entry error:", error)
    return NextResponse.json({ error: "Failed to delete entry" }, { status: 500 })
  }
}
