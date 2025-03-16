import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

export const createServerClient = async () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase environment variables are not set")
  }

  const cookieStore = await cookies()

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Cookie: cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join("; "),
      },
    },
  })
}
