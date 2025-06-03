import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import ProductCard from "../components/products/ProductCard"
import HeroSection from "../components/home/HeroSection"
import FeaturedCategories from "../components/home/FeaturedCategories"
import Newsletter from "../components/common/Newsletter"

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [newArrivals, setNewArrivals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // useEffect(() => {
  //   const fetchProducts = async () => {
  //     try {
  //       setLoading(true)

  //       // Fetch featured products
  //       const featuredResponse = await axios.get("/api/products", {
  //         params: { featured: true, limit: 4 },
  //       })

  //       // Fetch new arrivals
  //       const newArrivalsResponse = await axios.get("/api/products", {
  //         params: { sort: "createdAt", order: "desc", limit: 8 },
  //       })

  //       setFeaturedProducts(featuredResponse.data.products)
  //       setNewArrivals(newArrivalsResponse.data.products)
  //     } catch (error) {
  //       console.error("Error fetching products:", error)
  //       setError("Failed to load products. Please try again later.")
  //     } finally {
  //       setLoading(false)
  //     }
  //   }

  //   fetchProducts()
  // }, [])

  useEffect(() => {
    // Using dummy products for now.
    const dummyFeaturedProducts = [
      {
        _id: "1",
        title: "Wireless Headphones",
        category: "Electronics",
        image: "https://via.placeholder.com/300x300?text=Headphones",
        price: 99.99,
        compareAtPrice: 129.99,
        rating: 4.5,
        isOnSale: true,
        isNew: false,
      },
      {
        _id: "2",
        title: "Modern Lamp",
        category: "Home Decor",
        image: "https://via.placeholder.com/300x300?text=Lamp",
        price: 59.99,
        rating: 4.2,
        isOnSale: false,
        isNew: true,
      },
      {
        _id: "3",
        title: "Smart Watch",
        category: "Wearables",
        image: "https://via.placeholder.com/300x300?text=Smart+Watch",
        price: 199.99,
        compareAtPrice: 249.99,
        rating: 4.8,
        isOnSale: true,
        isNew: false,
      },
      {
        _id: "4",
        title: "Vintage Sunglasses",
        category: "Accessories",
        image: "https://via.placeholder.com/300x300?text=Sunglasses",
        price: 49.99,
        rating: 4.0,
        isOnSale: false,
        isNew: true,
      },
    ]

    const dummyNewArrivals = [
      {
        _id: "5",
        title: "Sports Shoes",
        category: "Footwear",
        image: "https://via.placeholder.com/300x300?text=Shoes",
        price: 89.99,
        rating: 4.3,
        isOnSale: false,
        isNew: true,
      },
      {
        _id: "6",
        title: "Leather Wallet",
        category: "Accessories",
        image: "https://via.placeholder.com/300x300?text=Wallet",
        price: 39.99,
        rating: 4.1,
        isOnSale: false,
        isNew: true,
      },
      {
        _id: "7",
        title: "Fitness Tracker",
        category: "Electronics",
        image: "https://via.placeholder.com/300x300?text=Tracker",
        price: 79.99,
        compareAtPrice: 99.99,
        rating: 4.6,
        isOnSale: true,
        isNew: false,
      },
      {
        _id: "8",
        title: "Bluetooth Speaker",
        category: "Electronics",
        image: "https://via.placeholder.com/300x300?text=Speaker",
        price: 129.99,
        rating: 4.7,
        isOnSale: false,
        isNew: true,
      },
    ]

    setFeaturedProducts(dummyFeaturedProducts)
    setNewArrivals(dummyNewArrivals)
    setLoading(false)
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
