"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { getSupabaseClient } from "@/lib/client"
import { useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LogOut, UserIcon } from "lucide-react"

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = getSupabaseClient()

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
      setLoading(false)
    }

    getUser()

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase.auth])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold">
          Image Storage
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className={`text-sm ${pathname === "/" ? "text-primary font-medium" : "text-muted-foreground"}`}
          >
            Home
          </Link>
          {!loading && user && (
            <Link
              href="/gallery"
              className={`text-sm ${pathname === "/gallery" ? "text-primary font-medium" : "text-muted-foreground"}`}
            >
              My Gallery
            </Link>
          )}
          {!loading && user && (
            <Link
              href="/upload"
              className={`text-sm ${pathname === "/upload" ? "text-primary font-medium" : "text-muted-foreground"}`}
            >
              Upload
            </Link>
          )}
          {!loading && !user ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Register</Link>
              </Button>
            </div>
          ) : !loading && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <UserIcon className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="text-muted-foreground">{user.email}</DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </nav>
      </div>
    </header>
  )
}

