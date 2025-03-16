import { NextResponse } from "next/server"
import cloudinary from "@/lib/cloudinary"
import { createServerClient } from "@/lib/server"

export async function DELETE(request: Request) {
  try {
    // Check if user is authenticated
    const supabase = createServerClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get public_id from query params
    const { searchParams } = new URL(request.url)
    const publicId = searchParams.get("publicId")

    if (!publicId) {
      return NextResponse.json({ error: "Public ID is required" }, { status: 400 })
    }

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId)

    if (result.result !== "ok") {
      throw new Error("Failed to delete image from Cloudinary")
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting image:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

