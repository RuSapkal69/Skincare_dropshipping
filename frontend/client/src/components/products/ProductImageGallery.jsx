"use client"

import { useState } from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline"

const ProductImageGallery = ({ images = [] }) => {
  const [currentImage, setCurrentImage] = useState(0)

  const defaultImages = ["/placeholder.svg?height=600&width=600"]
  const galleryImages = images.length > 0 ? images : defaultImages

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % galleryImages.length)
  }

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + galleryImages.length) % galleryImages.length)
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
        <img
          src={galleryImages[currentImage] || "/placeholder.svg"}
          alt={`Product image ${currentImage + 1}`}
          className="w-full h-full object-cover"
        />

        {galleryImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Image Counter */}
        {galleryImages.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
            {currentImage + 1} / {galleryImages.length}
          </div>
        )}
      </div>

      {/* Thumbnail Images */}
      {galleryImages.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto">
          {galleryImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImage(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                currentImage === index ? "border-primary" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <img
                src={image || "/placeholder.svg"}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProductImageGallery
