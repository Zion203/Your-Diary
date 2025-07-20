"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Moon, Sun, BookOpen, LogOut, Menu, X, Search, PenTool } from "lucide-react"

export function Navigation() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [theme, setTheme] = useState("light")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light"
    setTheme(savedTheme)
    document.documentElement.classList.toggle("dark", savedTheme === "dark")
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  return (
    <nav className="sticky top-0 z-50 glass-effect border-b border-slate-200/60 dark:border-slate-700/60">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-100 dark:to-slate-200 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
              <BookOpen className="h-4 w-4 text-white dark:text-slate-900" />
            </div>
            <span className="text-xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">Journal</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              href="/"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                pathname === "/"
                  ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/50"
              }`}
            >
              Home
            </Link>
            <Link
              href="/new"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                pathname === "/new"
                  ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/50"
              }`}
            >
              <PenTool className="h-4 w-4" />
              Write
            </Link>
            <Link
              href="/profile"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                pathname === "/profile"
                  ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/50"
              }`}
            >
              Profile
            </Link>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex w-9 h-9 text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800"
            >
              <Search className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="w-9 h-9 text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session?.user?.image || ""} />
                    <AvatarFallback className="text-xs font-medium bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700">
                      {session?.user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 glass-effect">
                <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-700">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{session?.user?.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{session?.user?.email}</p>
                </div>
                <DropdownMenuItem onClick={() => signOut()} className="text-red-600 dark:text-red-400">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden w-9 h-9"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200/60 dark:border-slate-700/60">
            <div className="py-4 space-y-1">
              <Link
                href="/"
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-slate-100 dark:hover:bg-slate-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/new"
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-slate-100 dark:hover:bg-slate-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                Write
              </Link>
              <Link
                href="/profile"
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-slate-100 dark:hover:bg-slate-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                Profile
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
