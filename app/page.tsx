import { Button } from "@/components/ui/button"
import Link from "next/link"
import { createServerClient } from "@/lib/server"
import { redirect } from "next/navigation"

export default async function Home() {
  const supabase = createServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    redirect("/gallery")
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
        Store Your Images <span className="text-primary">Securely</span>
      </h1>
      <p className="mt-6 text-lg text-muted-foreground max-w-3xl">
        Upload, store, and manage your images with our secure platform. Sign up today to get started with unlimited
        storage and easy access to your images.
      </p>
      <div className="mt-10 flex flex-col sm:flex-row gap-4">
        <Button size="lg" asChild>
          <Link href="/register">Get Started</Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href="/login">Login</Link>
        </Button>
      </div>
    </div>
  )
}

