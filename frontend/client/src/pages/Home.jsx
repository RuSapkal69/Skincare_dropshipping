import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import ProductCard from "../components/products/ProductCard"
// import HeroSection from "../components/home/HeroSection"
// import FeaturedCategories from "../components/home/FeaturedCategories"
// import Newsletter from "../components/common/Newsletter"

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [newArrivals, setNewArrivals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)

        // Fetch featured products
        const featuredResponse = await axios.get("/api/products", {
          params: { featured: true, limit: 4 },
        })

        // Fetch new arrivals
        const newArrivalsResponse = await axios.get("/api/products", {
          params: { sort: "createdAt", order: "desc", limit: 8 },
        })

        setFeaturedProducts(featuredResponse.data.products)
        setNewArrivals(newArrivalsResponse.data.products)
      } catch (error) {
        console.error("Error fetching products:", error)
        setError("Failed to load products. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  return (
    <div>
      <HeroSection />

      <section className="py-12 px-4 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">Featured Products</h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="animate-pulse bg-white rounded-lg shadow-md p-4">
                <div className="bg-gray-200 h-48 rounded-md mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <Link
            to="/products"
            className="inline-block px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
          >
            View All Products
          </Link>
        </div>
      </section>

      <FeaturedCategories />

      <section className="py-12 px-4 max-w-7xl mx-auto bg-gray-50">
        <h2 className="text-3xl font-bold mb-8 text-center">New Arrivals</h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="animate-pulse bg-white rounded-lg shadow-md p-4">
                <div className="bg-gray-200 h-48 rounded-md mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      <Newsletter />
    </div>
  )
}

export default Home
