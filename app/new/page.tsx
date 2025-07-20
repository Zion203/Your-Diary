  "use client"

  import type React from "react"

  import { useState, useRef, useEffect } from "react"
  import { useRouter } from "next/navigation"
  import { AuthGuard } from "@/components/auth-guard"
  import { Navigation } from "@/components/navigation"
  import { RichTextEditor } from "@/components/rich-text-editor"
  import { Button } from "@/components/ui/button"
  import { Input } from "@/components/ui/input"
  import { Label } from "@/components/ui/label"
  import { Badge } from "@/components/ui/badge"
  import { Upload, X, Plus, Calendar, ArrowLeft } from "lucide-react"
  import Image from "next/image"
  import Link from "next/link"

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

  export default function NewEntry() {
    const router = useRouter()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [content, setContent] = useState("")
    const [tags, setTags] = useState<string[]>([])
    const [newTag, setNewTag] = useState("")
    const [image, setImage] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [hasExistingEntry, setHasExistingEntry] = useState(false)

    const today = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    const todayISO = new Date().toISOString().split("T")[0]

    useEffect(() => {
      checkExistingEntry()
    }, [])

    const checkExistingEntry = async () => {
      try {
        const response = await fetch(`/api/entries/${todayISO}`)
        if (response.ok) {
          setHasExistingEntry(true)
        }
      } catch (error) {
        // Entry doesn't exist, which is fine
      }
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        setImage(file)
        const reader = new FileReader()
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string)
        }
        reader.readAsDataURL(file)
      }
    }

    const removeImage = () => {
      setImage(null)
      setImagePreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
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

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!content.trim()) {
        setError("Please write something in your diary entry")
        return
      }

      setLoading(true)
      setError("")

      try {
        let imageUrl = null

        if (image) {
          imageUrl = imagePreview
        }

        const response = await fetch("/api/entries", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: content.trim(),
            tags,
            imageUrl,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to save entry")
        }

        router.push("/")
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to save entry")
      } finally {
        setLoading(false)
      }
    }

    if (hasExistingEntry) {
      return (
        <AuthGuard>
          <div className="min-h-screen bg-white dark:bg-gray-900">
            <Navigation />
            <div className="max-w-4xl mx-auto px-6 py-12">
              <div className="text-center py-20">
                <Calendar className="h-16 w-16 mx-auto text-gray-300 mb-6" />
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">You've already written today</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                  You can only write one entry per day. Would you like to view or edit today's entry?
                </p>
                <div className="flex gap-4 justify-center">
                  <Link href={`/entry/${todayISO}`}>
                    <Button className="bg-gray-900 hover:bg-gray-800 text-white">View today's entry</Button>
                  </Link>
                  <Link href="/">
                    <Button variant="outline">Back to journal</Button>
                  </Link>
                </div>
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
              <Link
                href="/"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors mb-8"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm font-medium">Back to journal</span>
              </Link>

              <div className="space-y-2">
                <h1 className="text-4xl font-normal text-gray-900 dark:text-white">New Entry</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">{today}</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-12">
              {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>}

              {/* Content Editor */}
              <div className="space-y-4">
                <Label className="text-base font-medium">What's on your mind today?</Label>
                <div className="border rounded-lg">
                  <RichTextEditor content={content} onChange={setContent} placeholder="Start writing your thoughts..." />
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Add an Image (Optional)</Label>
                {imagePreview ? (
                  <div className="relative max-w-md">
                    <Image
                      src={imagePreview || "/placeholder.svg"}
                      alt="Preview"
                      width={400}
                      height={300}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-3 right-3"
                      onClick={removeImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed border-gray-200 rounded-lg p-12 text-center cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition-colors max-w-md"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-600">Click to upload an image</p>
                    <p className="text-sm text-gray-400 mt-1">PNG, JPG up to 10MB</p>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </div>

              {/* Tags */}
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
                    placeholder="Add a custom tag..."
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
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Quick tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_TAGS.filter((tag) => !tags.includes(tag)).map((tag) => (
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

              {/* Submit Button */}
              <div className="flex justify-end pt-8 border-t border-gray-100 dark:border-gray-800">
                <Button
                  type="submit"
                  disabled={loading || !content.trim()}
                    className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 text-white px-6 py-2 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  {loading ? "Publishing..." : "Publish entry"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </AuthGuard>
    )
  }

  
