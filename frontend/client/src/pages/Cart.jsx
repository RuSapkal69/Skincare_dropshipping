import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { TrashIcon } from "@heroicons/react/24/outline"

const Cart = () => {
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true)

        const response = await axios.get("/api/cart")

        if (response.data.success) {
          setCart(response.data.cart)
        }
      } catch (error) {
        console.error("Error fetching cart:", error)
        setError("Failed to load cart. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchCart()
  }, [])

  const handleQuantityChange = async (itemId, quantity) => {
    try {
      if (quantity < 1) return

      const response = await axios.put(`/api/cart/item/${itemId}`, { quantity })

      if (response.data.success) {
        setCart(response.data.cart)
      }
    } catch (error) {
      console.error("Error updating cart item:", error)
    }
  }

  const handleRemoveItem = async (itemId) => {
    try {
      const response = await axios.delete(`/api/cart/item/${itemId}`)

      if (response.data.success) {
        setCart(response.data.cart)
      }
    } catch (error) {
      console.error("Error removing cart item:", error)
    }
  }

  const calculateSubtotal = () => {
    if (!cart || !cart.items || cart.items.length === 0) return 0

    return cart.items.reduce((total, item) => {
      return total + item.price * item.quantity
    }, 0)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
        <div className="animate-pulse">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="flex py-6 border-b">
              <div className="h-24 w-24 bg-gray-200 rounded-md"></div>
              <div className="ml-4 flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="h-6 w-20 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
        <div className="bg-red-100 p-4 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    )
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
        <div className="text-center py-12">
          <h2 className="text-xl font-medium mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Looks like you haven't added any products to your cart yet.</p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Cart Items */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flow-root">
                <ul className="-my-6 divide-y divide-gray-200">
                  {cart.items.map((item) => (
                    <li key={item._id} className="py-6 flex">
                      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                        <img
                          src={item.product.image || "/placeholder.svg"}
                          alt={item.product.title}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>

                      <div className="ml-4 flex flex-1 flex-col">
                        <div>
                          <div className="flex justify-between text-base font-medium text-gray-900">
                            <h3>
                              <Link to={`/product/${item.product._id}`}>{item.product.title}</Link>
                            </h3>
                            <p className="ml-4">${item.price.toFixed(2)}</p>
                          </div>
                          {item.variant && <p className="mt-1 text-sm text-gray-500">Variant: {item.variant.name}</p>}
                        </div>

                        <div className="flex flex-1 items-end justify-between text-sm">
                          <div className="flex items-center">
                            <button
                              className="w-8 h-8 border border-gray-300 rounded-l-md flex items-center justify-center hover:bg-gray-100"
                              onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(item._id, Number.parseInt(e.target.value))}
                              className="w-12 h-8 border-t border-b border-gray-300 text-center"
                            />
                            <button
                              className="w-8 h-8 border border-gray-300 rounded-r-md flex items-center justify-center hover:bg-gray-100"
                              onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                            >
                              +
                            </button>
                          </div>

                          <div className="flex">
                            <button
                              type="button"
                              className="font-medium text-red-600 hover:text-red-500"
                              onClick={() => handleRemoveItem(item._id)}
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>

            <div className="border-t border-gray-200 py-4">
              <div className="flex justify-between mb-2">
                <p className="text-sm text-gray-600">Subtotal</p>
                <p className="text-sm font-medium text-gray-900">${calculateSubtotal().toFixed(2)}</p>
              </div>

              <div className="flex justify-between mb-2">
                <p className="text-sm text-gray-600">Shipping</p>
                <p className="text-sm font-medium text-gray-900">Calculated at checkout</p>
              </div>

              <div className="flex justify-between mb-2">
                <p className="text-sm text-gray-600">Tax</p>
                <p className="text-sm font-medium text-gray-900">Calculated at checkout</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between mb-4">
                <p className="text-base font-medium text-gray-900">Total</p>
                <p className="text-base font-medium text-gray-900">${calculateSubtotal().toFixed(2)}</p>
              </div>

              <button
                className="w-full bg-primary hover:bg-primary-dark text-white py-3 px-4 rounded-md"
                onClick={() => navigate("/checkout")}
              >
                Proceed to Checkout
              </button>

              <div className="mt-4 text-center">
                <Link to="/" className="text-sm text-primary hover:underline">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
