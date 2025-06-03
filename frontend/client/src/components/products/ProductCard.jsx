import { Link } from "react-router-dom"
import { ShoppingCartIcon, HeartIcon } from "@heroicons/react/24/outline"

const ProductCard = ({ product }) => {
  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      // Add to cart logic here
      console.log("Adding to cart:", product._id)
    } catch (error) {
      console.error("Error adding to cart:", error)
    }
  }

  const handleAddToWishlist = (e) => {
    e.preventDefault()
    e.stopPropagation()

    // Add to wishlist logic here
    console.log("Adding to wishlist:", product._id)
  }

  return (
    <div className="group relative bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:shadow-lg hover:-translate-y-1">
      {/* Product Badge (if on sale or new) */}
      {product.isOnSale && (
        <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">SALE</div>
      )}

      {product.isNew && (
        <div className="absolute top-2 left-2 z-10 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
          NEW
        </div>
      )}

      {/* Product Image */}
      <Link to={`/product/${product._id}`} className="block relative h-48 overflow-hidden">
        <img
          src={product.image || "/placeholder.svg"}
          alt={product.title}
          className="w-full h-full object-cover object-center transition-transform group-hover:scale-105"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/300x300?text=No+Image"
          }}
        />

        {/* Quick Action Buttons */}
        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleAddToCart}
            className="bg-white text-gray-800 p-2 rounded-full mx-1 hover:bg-primary hover:text-white transition-colors"
            title="Add to Cart"
          >
            <ShoppingCartIcon className="h-5 w-5" />
          </button>
          <button
            onClick={handleAddToWishlist}
            className="bg-white text-gray-800 p-2 rounded-full mx-1 hover:bg-primary hover:text-white transition-colors"
            title="Add to Wishlist"
          >
            <HeartIcon className="h-5 w-5" />
          </button>
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="text-sm text-gray-500">{product.category}</h3>
        <Link to={`/product/${product._id}`} className="block mt-1">
          <h2 className="text-lg font-medium text-gray-900 truncate">{product.title}</h2>
        </Link>

        <div className="mt-2 flex items-center justify-between">
          <div>
            {product.compareAtPrice ? (
              <div className="flex items-center">
                <span className="text-lg font-bold text-primary">${product.price.toFixed(2)}</span>
                <span className="ml-2 text-sm text-gray-500 line-through">${product.compareAtPrice.toFixed(2)}</span>
              </div>
            ) : (
              <span className="text-lg font-bold text-gray-900">${product.price.toFixed(2)}</span>
            )}
          </div>

          {/* Rating Stars */}
          {product.rating && (
            <div className="flex items-center">
              <span className="text-yellow-400">★</span>
              <span className="ml-1 text-sm text-gray-600">{product.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductCard
