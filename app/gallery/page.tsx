import { createServerClient } from "@/lib/server"
import { redirect } from "next/navigation"
import ImageGallery from "@/components/image-gallery"

export default async function GalleryPage() {
  const supabase = createServerClient()

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Fetch user's images
  const { data: images, error } = await supabase.from("images").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching images:", error)
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Gallery</h1>
      </div>

      <ImageGallery images={images || []} />
    </div>
  )
}

