import { NextResponse } from "next/server"
import { getSignature } from "@/lib/cloudinary"
import { createServerClient } from "@/lib/server"

export async function GET() {
  try {
    // Check if user is authenticated
    const supabase = createServerClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Generate signature
    const { signature, timestamp } = getSignature()

    return NextResponse.json({ signature, timestamp })
  } catch (error) {
    console.error("Error generating signature:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

