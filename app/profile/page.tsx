"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { AuthGuard } from "@/components/auth-guard"
import { Navigation } from "@/components/navigation"
import type { UserStats } from "@/types/diary"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, Award, BookOpen, Tag } from "lucide-react"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

export default function Profile() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    } finally {
      setLoading(false)
    }
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


  if (!stats) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Navigation />
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400">Failed to load statistics</p>
            </div>
          </div>
        </div>
      </AuthGuard>
    )
  }

  const chartData = stats.entriesPerDay.map((item) => ({
    date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    entries: item.count,
  }))

  const topTags = stats.tagFrequency.slice(0, 10)
  const pieData = stats.tagFrequency.slice(0, 6).map((item) => ({
    name: item.tag,
    value: item.count,
  }))

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />

        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* Profile Header */}
          <div className="mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={session?.user?.image || ""} />
                    <AvatarFallback className="text-2xl">{session?.user?.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {session?.user?.name || "User"}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">{session?.user?.email}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                      Member since {new Date().getFullYear()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalEntries}</div>
                <p className="text-xs text-muted-foreground">Keep writing!</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.currentStreak}</div>
                <p className="text-xs text-muted-foreground">{stats.currentStreak === 1 ? "day" : "days"} in a row</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Longest Streak</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.longestStreak}</div>
                <p className="text-xs text-muted-foreground">Personal best</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unique Tags</CardTitle>
                <Tag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.tagFrequency.length}</div>
                <p className="text-xs text-muted-foreground">Different emotions</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Writing Consistency Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Writing Consistency (Last 30 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="entries"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      dot={{ fill: "#3B82F6" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Tag Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Emotion Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Top Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Most Used Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topTags}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tag" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Tag Cloud */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Tag Cloud</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {stats.tagFrequency.map((tag) => (
                  <Badge
                    key={tag.tag}
                    variant="outline"
                    className="text-sm"
                    style={{
                      fontSize: `${Math.max(0.75, Math.min(1.5, tag.count / 5))}rem`,
                      opacity: Math.max(0.6, Math.min(1, tag.count / 10)),
                    }}
                  >
                    {tag.tag} ({tag.count})
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  )
}
