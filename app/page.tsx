"use client"

import { useState, useEffect } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { Navigation } from "@/components/navigation"
import type { DiaryEntry } from "@/types/diary"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, ImageIcon, BookOpen, PenTool, Calendar, Clock } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function Dashboard() {
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [filteredEntries, setFilteredEntries] = useState<DiaryEntry[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showImageOnly, setShowImageOnly] = useState(false)
  const [loading, setLoading] = useState(true)

  const allTags = Array.from(new Set(entries.flatMap((entry) => entry.tags))).sort()

  useEffect(() => {
    fetchEntries()
  }, [])

  useEffect(() => {
    filterEntries()
  }, [entries, searchTerm, selectedTags, showImageOnly])

  const fetchEntries = async () => {
    try {
      const response = await fetch("/api/entries")
      if (response.ok) {
        const data = await response.json()
        setEntries(data)
        setLoading(false)

      }
    } catch (error) {
      console.error("Failed to fetch entries:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterEntries = () => {
    let filtered = entries

    if (searchTerm) {
      filtered = filtered.filter((entry) => entry.content.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter((entry) => selectedTags.some((tag) => entry.tags.includes(tag)))
    }

    if (showImageOnly) {
      filtered = filtered.filter((entry) => entry.imageUrl)
    }

    setFilteredEntries(filtered)
  }

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  const getPreview = (content: string) => {
    const textContent = content.replace(/<[^>]*>/g, "")
    return textContent.length > 180 ? textContent.substring(0, 180) + "..." : textContent
  }

  const getReadingTime = (content: string) => {
    const words = content.replace(/<[^>]*>/g, "").split(/\s+/).length
    return Math.ceil(words / 200)
  }

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
          <Navigation />
          <div className="max-w-4xl mx-auto px-6 py-16">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-slate-600 dark:border-slate-600 dark:border-t-slate-300"></div>
            </div>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <Navigation />

        <div className="max-w-4xl mx-auto px-6 py-16">
          {/* Header */}
          <div className="mb-16">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h1 className="text-5xl font-semibold text-slate-900 dark:text-slate-100 mb-4 tracking-tight">
                  Your Journal
                </h1>
                <p className="text-xl text-slate-600 dark:text-slate-400">
                  {entries.length} {entries.length === 1 ? "entry" : "entries"} • Your thoughts, preserved
                </p>
              </div>
              <Link href="/new">
                <Button className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all">
                  <PenTool className="h-4 w-4 mr-2" />
                  New Entry
                </Button>
              </Link>
            </div>

            {/* Search and Filters */}
            <div className="space-y-8">
              <div className="relative max-w-lg">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400" />
                </div>
                <Input
                  placeholder="Search your thoughts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-3 text-base bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm"
                />
              </div>

              {/* Tag Filters */}
              {allTags.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Filter className="h-4 w-4 text-slate-500" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Filter by mood:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        className={`cursor-pointer px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          selectedTags.includes(tag)
                            ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-md"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700"
                        }`}
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Entries */}
          {filteredEntries.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <BookOpen className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
                {entries.length === 0 ? "Begin your journey" : "No entries found"}
              </h3>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">
                {entries.length === 0
                  ? "Start documenting your thoughts, experiences, and memories in your personal digital sanctuary."
                  : "Try adjusting your search or filters to find what you're looking for."}
              </p>
              {entries.length === 0 && (
                <Link href="/new">
                  <Button className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 text-white px-8 py-4 rounded-xl font-medium text-lg shadow-lg hover:shadow-xl transition-all">
                    <PenTool className="h-5 w-5 mr-2" />
                    Write your first entry
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              {filteredEntries.map((entry, index) => (
                <Link key={entry._id} href={`/entry/${entry.date}`}>
                  <article className="group cursor-pointer">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-200/60 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600">
                      <div className="flex gap-8">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                              <Calendar className="h-4 w-4" />
                              <time className="text-sm font-medium">{formatDate(entry.date)}</time>
                            </div>
                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                              <Clock className="h-4 w-4" />
                              <span className="text-sm">{getReadingTime(entry.content)} min read</span>
                            </div>
                            {entry.imageUrl && (
                              <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                                <ImageIcon className="h-4 w-4" />
                                <span className="text-sm">Photo</span>
                              </div>
                            )}
                          </div>

                          <div className="prose prose-lg max-w-none mb-6">
                            <p className="text-slate-800 dark:text-slate-200 leading-relaxed text-lg font-normal">
                              {getPreview(entry.content)}
                            </p>
                          </div>

                          {entry.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {entry.tags.slice(0, 4).map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="secondary"
                                  className="px-3 py-1 text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 rounded-full"
                                >
                                  {tag}
                                </Badge>
                              ))}
                              {entry.tags.length > 4 && (
                                <Badge
                                  variant="secondary"
                                  className="px-3 py-1 text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 rounded-full"
                                >
                                  +{entry.tags.length - 4} more
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>

                        {entry.imageUrl && (
                          <div className="w-40 h-32 flex-shrink-0">
                            <Image
                              src={entry.imageUrl || "/placeholder.svg"}
                              alt="Entry image"
                              width={160}
                              height={128}
                              className="w-full h-full object-cover rounded-xl"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}
