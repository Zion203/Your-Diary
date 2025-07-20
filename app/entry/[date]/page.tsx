"use client"

import { ArrowLeft, Edit3, X, Plus, Calendar, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { format } from "date-fns"
import { RichTextEditor } from "@/components/rich-text-editor"
import { AuthGuard } from "@/components/auth-guard"
import { Navigation } from "@/components/navigation"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const COMMON_TAGS = [
  "happy",
  "sad",
  "excited",
  "grateful",
  "stressed",
  "peaceful",
  "productive",
  "creative",
  "tired",
  "energetic",
  "reflective",
  "anxious",
  "confident",
  "nostalgic",
  "hopeful",
  "frustrated",
]

interface Entry {
  date: string
  content: string
  tags: string[]
}

interface Props {
  params: {
    date: string
  }
}

const formatDate = (date: Date): string => {
  return date.toISOString().split("T")[0]
}

export default function EntryPage({ params }: Props) {
  const { date } = params
  const router = useRouter()
  const [entry, setEntry] = useState<Entry | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const today = new Date().toISOString().split("T")[0]
  const canEdit = date === today

  useEffect(() => {
    fetchEntry()
  }, [date])

  const fetchEntry = async () => {
    try {
      const response = await fetch(`/api/entries/${date}`)
      if (response.ok) {
        const data = await response.json()
        setEntry(data)
        setContent(data.content)
        setTags(data.tags || [])
      } else if (response.status === 404) {
        setEntry(null)
      }
    } catch (error) {
      console.error("Failed to fetch entry:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setContent(entry?.content || "")
    setTags(entry?.tags || [])
    setError("")
  }

  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag])
    }
    setNewTag("")
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleSave = async () => {
    if (!content.trim()) {
      setError("Please write something in your diary entry")
      return
    }

    setSaving(true)
    setError("")

    try {
      const response = await fetch(`/api/entries/${date}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: content.trim(),
          tags,
        }),
      })

      if (response.ok) {
        const updatedEntry = await response.json()
        setEntry(updatedEntry)
        setIsEditing(false)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to save entry")
      }
    } catch (error) {
      setError("Failed to save entry")
    } finally {
      setSaving(false)
    }
  }

  const getReadingTime = (content: string) => {
    const words = content.replace(/<[^>]*>/g, "").split(/\s+/).length
    return Math.ceil(words / 200)
  }

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-white dark:bg-gray-900">
          <Navigation />
          <div className="max-w-4xl mx-auto px-6 py-12">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-900"></div>
            </div>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Navigation />

        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <Link
                href="/"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm font-medium">Back to journal</span>
              </Link>

              {canEdit && !isEditing && (
                <Button onClick={handleEdit} variant="outline" className="flex items-center gap-2 bg-transparent">
                  <Edit3 className="h-4 w-4" />
                  Edit entry
                </Button>
              )}

              {isEditing && (
                <div className="flex items-center gap-3">
                  <Button onClick={handleCancel} variant="ghost" size="sm">
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={saving} className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 text-white px-6 py-2 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
>
                    {saving ? "Saving..." : "Save changes"}
                  </Button>
                </div>
              )}
            </div>

            {/* Entry metadata */}
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <time>{format(new Date(date), "PPP")}</time>
                </div>
                {entry && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{getReadingTime(entry.content)} min read</span>
                  </div>
                )}
                {canEdit && (
                  <Badge variant="secondary" className="text-xs">
                    Today's entry
                  </Badge>
                )}
              </div>

              {/* Tags */}
              {isEditing ? (
                <div className="space-y-4">
                  <Label className="text-base font-medium">Tags</Label>

                  {/* Current Tags */}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="default" className="flex items-center gap-1 px-3 py-1">
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 hover:bg-red-500 rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Add Custom Tag */}
                  <div className="flex gap-2 max-w-md">
                    <Input
                      placeholder="Add a tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          addTag(newTag)
                        }
                      }}
                      className="flex-1"
                    />
                    <Button type="button" variant="outline" onClick={() => addTag(newTag)} disabled={!newTag.trim()}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Common Tags */}
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Quick tags:</p>
                    <div className="flex flex-wrap gap-2">
                      {COMMON_TAGS.filter((tag) => !tags.includes(tag))
                        .slice(0, 8)
                        .map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-1"
                            onClick={() => addTag(tag)}
                          >
                            {tag}
                          </Badge>
                        ))}
                    </div>
                  </div>
                </div>
              ) : (
                tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="px-3 py-1 rounded-full">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>

          {/* Error message */}
          {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>}

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            {isEditing ? (
              <div className="space-y-4">
                <Label className="text-base font-medium">Content</Label>
                <div className="border rounded-lg">
                  <RichTextEditor content={content} onChange={setContent} placeholder="What's on your mind today?" />
                </div>
              </div>
            ) : entry ? (
              <div
                className="prose prose-lg max-w-none prose-headings:font-charter prose-headings:font-normal"
                dangerouslySetInnerHTML={{ __html: entry.content }}
              />
            ) : (
              <div className="text-center py-20">
                <div className="text-gray-400 mb-4">
                  <Calendar className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No entry for this date</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  You haven't written anything for {format(new Date(date), "PPP")} yet.
                </p>
                {canEdit && (
                  <Link href="/new">
                    <Button className="bg-gray-900 hover:bg-gray-800 text-white">Write today's entry</Button>
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-16 pt-8 border-t border-gray-100 dark:border-gray-800">
            <Button
              variant="ghost"
              onClick={() => {
                const prevDate = new Date(date)
                prevDate.setDate(prevDate.getDate() - 1)
                router.push(`/entry/${prevDate.toISOString().split("T")[0]}`)
              }}
              className="flex items-center gap-2"
            >
              ← Previous day
            </Button>

            <Button
              variant="ghost"
              onClick={() => {
                const nextDate = new Date(date)
                nextDate.setDate(nextDate.getDate() + 1)
                const nextDateStr = nextDate.toISOString().split("T")[0]
                if (nextDateStr <= today) {
                  router.push(`/entry/${nextDateStr}`)
                }
              }}
              disabled={date >= today}
              className="flex items-center gap-2"
            >
              Next day →
            </Button>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
