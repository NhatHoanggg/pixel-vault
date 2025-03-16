"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { getSupabaseClient } from "@/lib/client"
import { useToast } from "@/hooks/use-toast"
import { Upload, ImageIcon } from "lucide-react"

export default function UploadPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  })
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview)
      }
    }
  }, [preview])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]

      if (!selectedFile.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file.",
          variant: "destructive",
        })
        return
      }

      setFile(selectedFile)
      setPreview(URL.createObjectURL(selectedFile))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select an image to upload.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/cloudinary/signature")
      const { signature, timestamp } = await response.json()

      const uploadData = new FormData()
      uploadData.append("file", file)
      uploadData.append("signature", signature)
      uploadData.append("timestamp", timestamp)
      uploadData.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || "")

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: uploadData,
        },
      )

      const uploadResult = await uploadResponse.json()

      if (uploadResult.error) {
        throw new Error(uploadResult.error.message)
      }

      const supabase = getSupabaseClient()
      const { error } = await supabase.from("images").insert({
        title: formData.title,
        description: formData.description,
        image_url: uploadResult.secure_url,
        cloudinary_public_id: uploadResult.public_id,
      })

      if (error) {
        throw error
      }

      toast({
        title: "Upload successful",
        description: "Your image has been uploaded successfully.",
      })

      router.push("/gallery")
      router.refresh()
    } catch (error) {
      // toast({
      //   title: "Upload failed",
      //   description: error.message || "Something went wrong. Please try again.",
      //   variant: "destructive",
      // })
      if (error instanceof Error) {
        toast({
          title: "Upload failed",
          description: error.message ||  "Something went wrong. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Upload failed",
          description: "An unknown error occurred.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Upload Image</CardTitle>
          <CardDescription>Upload a new image to your gallery</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="Enter image title"
                required
                value={formData.title}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Enter image description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Image</Label>
              <div
                className="flex items-center justify-center border-2 border-dashed rounded-md p-6 cursor-pointer"
                onClick={() => document.getElementById("image")?.click()}
              >
                <input id="image" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                {preview ? (
                  <div className="text-center">
                    <img src={preview} alt="Preview" className="mx-auto max-h-64 mb-4 rounded-md" />
                    <p className="text-sm text-muted-foreground">Click to change image</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">Click to select an image</p>
                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG, GIF up to 10MB</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Image
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
