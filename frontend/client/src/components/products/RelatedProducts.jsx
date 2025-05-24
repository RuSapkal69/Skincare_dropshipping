"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import ProductCard from "./ProductCard"

const RelatedProducts = ({ categoryId, currentProductId }) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        setLoading(true)

        const response = await axios.get("/api/products", {
          params: {
            category: categoryId,
            limit: 4,
          },
        })

        if (response.data.success) {
          // Filter out the current product
          const filteredProducts = response.data.products.filter((product) => product._id !== currentProductId)
          setProducts(filteredProducts.slice(0, 4))
        }
      } catch (error) {
        console.error("Error fetching related products:", error)
      } finally {
        setLoading(false)
      }
    }

    if (categoryId) {
      fetchRelatedProducts()
    }
  }, [categoryId, currentProductId])

  if (loading) {
    return (
      <section className="mt-16">
        <h2 className="text-2xl font-bold mb-8">Related Products</h2>
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
      </section>
    )
  }

  if (products.length === 0) {
    return null
  }

  return (
    <section className="mt-16">
      <h2 className="text-2xl font-bold mb-8">Related Products</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  )
}

export default RelatedProducts
