"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash2, ExternalLink } from "lucide-react";
import { getSupabaseClient } from "@/lib/client";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface GalleryImage {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  cloudinary_public_id: string;
  created_at: string;
}

interface ImageGalleryProps {
  images: GalleryImage[];
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [displayImages, setDisplayImages] = useState<GalleryImage[]>(images);

  const handleDelete = async (image: GalleryImage) => {
    if (isDeleting) return;

    setIsDeleting(true);

    try {
      // Delete from Cloudinary
      await fetch(
        `/api/cloudinary/delete?publicId=${image.cloudinary_public_id}`,
        {
          method: "DELETE",
        }
      );

      // Delete from Supabase
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from("images")
        .delete()
        .eq("id", image.id);

      if (error) {
        throw error;
      }

      // Update UI
      setDisplayImages(displayImages.filter((img) => img.id !== image.id));
      setSelectedImage(null);

      toast({
        title: "Image deleted",
        description: "The image has been deleted successfully.",
      });
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: "Delete failed",
          description:
            error.message || "Something went wrong. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Delete failed",
          description: "An unknown error occurred.",
          variant: "destructive",
        });
      }
    }
  };

  if (displayImages.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">No images found</h2>
        <p className="text-muted-foreground mb-6">
          You haven&apos;t uploaded any images yet.
        </p>
        <Button onClick={() => router.push("/upload")}>
          Upload Your First Image
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {displayImages.map((image) => (
        <Card key={image.id} className="overflow-hidden">
          <CardContent className="p-0">
            <Dialog>
              <DialogTrigger asChild>
                <div
                  className="relative aspect-square cursor-pointer"
                  onClick={() => setSelectedImage(image)}
                >
                  <Image
                    src={image.image_url || "/placeholder.svg"}
                    alt={image.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-all hover:scale-105"
                  />
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>{selectedImage?.title}</DialogTitle>
                  <DialogDescription>
                    {selectedImage?.description}
                  </DialogDescription>
                </DialogHeader>
                <div className="relative aspect-video w-full">
                  {selectedImage && (
                    <Image
                      src={selectedImage.image_url || "/placeholder.svg"}
                      alt={selectedImage.title}
                      fill
                      className="object-contain"
                    />
                  )}
                </div>
                <div className="flex justify-between">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => selectedImage && handleDelete(selectedImage)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {isDeleting ? "Deleting..." : "Delete"}
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={selectedImage?.image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open Original
                    </a>
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <div className="p-3">
              <h3 className="font-medium truncate">{image.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(image.created_at).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
