import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import axios from "axios"
import { StarIcon, ShoppingCartIcon, HeartIcon } from "@heroicons/react/24/outline"
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid"
// import ProductImageGallery from "../components/products/ProductImageGallery"
// import RelatedProducts from "../components/products/RelatedProducts"

const ProductDetail = () => {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedVariant, setSelectedVariant] = useState(null)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)

        const response = await axios.get(`/api/products/${id}`)

        if (response.data.success) {
          setProduct(response.data.product)

          // Set default variant if available
          if (response.data.product.variants && response.data.product.variants.length > 0) {
            setSelectedVariant(response.data.product.variants[0])
          }
        } else {
          setError("Product not found")
        }
      } catch (error) {
        console.error("Error fetching product:", error)
        setError("Failed to load product. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  const handleQuantityChange = (e) => {
    const value = Number.parseInt(e.target.value)
    if (value > 0 && value <= (product?.inventory || 10)) {
      setQuantity(value)
    }
  }

  const incrementQuantity = () => {
    if (quantity < (product?.inventory || 10)) {
      setQuantity(quantity + 1)
    }
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const handleAddToCart = async () => {
    try {
      const response = await axios.post("/api/cart", {
        productId: product._id,
        quantity,
        variantId: selectedVariant?._id,
      })

      if (response.data.success) {
        // Show success message or update cart count
        console.log("Added to cart successfully")
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-200 h-96 rounded-lg"></div>
            <div>
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-6"></div>
              <div className="h-10 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="h-12 bg-gray-200 rounded mb-4"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-red-100 p-4 rounded-lg">
          <p className="text-red-700">{error || "Product not found"}</p>
          <Link to="/" className="text-primary hover:underline mt-4 inline-block">
            Return to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <ProductImageGallery images={product.images || [product.image]} />

        {/* Product Details */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.title}</h1>

          {/* Rating */}
          <div className="flex items-center mb-4">
            <div className="flex">
              {[...Array(5)].map((_, index) => (
                <span key={index}>
                  {index < Math.floor(product.rating || 0) ? (
                    <StarIconSolid className="h-5 w-5 text-yellow-400" />
                  ) : (
                    <StarIcon className="h-5 w-5 text-yellow-400" />
                  )}
                </span>
              ))}
            </div>
            <span className="ml-2 text-sm text-gray-600">({product.numReviews || 0} reviews)</span>
          </div>

          {/* Price */}
          <div className="text-2xl font-bold text-primary mb-4">
            ${selectedVariant?.price || product.price}
            {product.compareAtPrice && (
              <span className="ml-2 text-lg text-gray-500 line-through">
                ${selectedVariant?.compareAtPrice || product.compareAtPrice}
              </span>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <p className="text-gray-700">{product.description}</p>
          </div>

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Variants</h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant._id}
                    className={`px-3 py-1 border rounded-md ${
                      selectedVariant?._id === variant._id
                        ? "border-primary bg-primary text-white"
                        : "border-gray-300 hover:border-primary"
                    }`}
                    onClick={() => setSelectedVariant(variant)}
                  >
                    {variant.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Quantity</h3>
            <div className="flex items-center">
              <button
                className="w-10 h-10 border border-gray-300 rounded-l-md flex items-center justify-center hover:bg-gray-100"
                onClick={decrementQuantity}
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max={product.inventory || 10}
                value={quantity}
                onChange={handleQuantityChange}
                className="w-16 h-10 border-t border-b border-gray-300 text-center"
              />
              <button
                className="w-10 h-10 border border-gray-300 rounded-r-md flex items-center justify-center hover:bg-gray-100"
                onClick={incrementQuantity}
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart */}
          <div className="flex space-x-4">
            <button
              className="flex-1 bg-primary hover:bg-primary-dark text-white py-3 px-6 rounded-md flex items-center justify-center"
              onClick={handleAddToCart}
            >
              <ShoppingCartIcon className="h-5 w-5 mr-2" />
              Add to Cart
            </button>

            <button className="w-12 h-12 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-100">
              <HeartIcon className="h-6 w-6 text-gray-600" />
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-8 border-t border-gray-200 pt-4">
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <span className="font-medium mr-2">SKU:</span>
              <span>{product.sku || "N/A"}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <span className="font-medium mr-2">Category:</span>
              <span>{product.category || "N/A"}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <span className="font-medium mr-2">Availability:</span>
              <span>{product.inventory > 0 ? `In Stock (${product.inventory} left)` : "Out of Stock"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mt-12">{/* Tab content here */}</div>

      {/* Related Products */}
      <RelatedProducts categoryId={product.category} currentProductId={product._id} />
    </div>
  )
}

export default ProductDetail
