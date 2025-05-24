import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { CreditCardIcon, TruckIcon, MapPinIcon } from "@heroicons/react/24/outline"

const Checkout = () => {
  const [cart, setCart] = useState(null)
  const [addresses, setAddresses] = useState([])
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState("COD")
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch cart
        const cartResponse = await axios.get("/api/users/cart")
        if (cartResponse.data.success) {
          setCart(cartResponse.data.cart)
        }

        // Fetch addresses
        const addressResponse = await axios.get("/api/users/addresses")
        if (addressResponse.data.success) {
          setAddresses(addressResponse.data.addresses)
          // Set default address
          const defaultAddr = addressResponse.data.addresses.find((addr) => addr.isDefault)
          if (defaultAddr) {
            setSelectedAddress(defaultAddr)
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Failed to load checkout data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const calculateTotals = () => {
    if (!cart || !cart.items) return { subtotal: 0, tax: 0, shipping: 0, total: 0 }

    const subtotal = cart.items.reduce((total, item) => total + item.price * item.quantity, 0)
    const tax = subtotal * 0.1 // 10% tax
    const shipping = subtotal > 100 ? 0 : 10 // Free shipping over $100
    const total = subtotal + tax + shipping

    return { subtotal, tax, shipping, total }
  }

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      setError("Please select a shipping address")
      return
    }

    if (!cart || cart.items.length === 0) {
      setError("Your cart is empty")
      return
    }

    try {
      setProcessing(true)
      setError(null)

      const { subtotal, tax, shipping, total } = calculateTotals()

      const orderData = {
        orderItems: cart.items.map((item) => ({
          product: item.product._id,
          name: item.product.title,
          image: item.product.images?.[0] || item.product.image,
          price: item.price,
          quantity: item.quantity,
          variant: item.variant,
        })),
        shippingAddress: selectedAddress,
        paymentMethod,
        itemsPrice: subtotal,
        taxPrice: tax,
        shippingPrice: shipping,
        totalPrice: total,
      }

      const response = await axios.post("/api/orders", orderData)

      if (response.data.success) {
        navigate(`/order/${response.data.order._id}`)
      }
    } catch (error) {
      console.error("Error placing order:", error)
      setError(error.response?.data?.message || "Failed to place order")
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-48 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-8">Add some products to your cart before checkout.</p>
          <button
            onClick={() => navigate("/")}
            className="bg-primary text-white px-6 py-3 rounded-md hover:bg-primary-dark"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    )
  }

  const { subtotal, tax, shipping, total } = calculateTotals()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <MapPinIcon className="h-6 w-6 text-primary mr-2" />
              <h2 className="text-xl font-semibold">Shipping Address</h2>
            </div>

            {addresses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">No addresses found</p>
                <button onClick={() => navigate("/profile")} className="text-primary hover:underline">
                  Add an address
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((address) => (
                  <div
                    key={address._id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedAddress?._id === address._id
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedAddress(address)}
                  >
                    <div className="flex items-start">
                      <input
                        type="radio"
                        checked={selectedAddress?._id === address._id}
                        onChange={() => setSelectedAddress(address)}
                        className="mt-1 mr-3"
                      />
                      <div>
                        <p className="font-medium">{address.name}</p>
                        <p className="text-gray-600">{address.address}</p>
                        <p className="text-gray-600">
                          {address.city}, {address.state} {address.postalCode}
                        </p>
                        <p className="text-gray-600">{address.phone}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <CreditCardIcon className="h-6 w-6 text-primary mr-2" />
              <h2 className="text-xl font-semibold">Payment Method</h2>
            </div>

            <div className="space-y-3">
              <div
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  paymentMethod === "COD" ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setPaymentMethod("COD")}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    checked={paymentMethod === "COD"}
                    onChange={() => setPaymentMethod("COD")}
                    className="mr-3"
                  />
                  <div>
                    <p className="font-medium">Cash on Delivery</p>
                    <p className="text-sm text-gray-600">Pay when you receive your order</p>
                  </div>
                </div>
              </div>

              <div
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  paymentMethod === "Card" ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setPaymentMethod("Card")}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    checked={paymentMethod === "Card"}
                    onChange={() => setPaymentMethod("Card")}
                    className="mr-3"
                  />
                  <div>
                    <p className="font-medium">Credit/Debit Card</p>
                    <p className="text-sm text-gray-600">Pay securely with your card</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <TruckIcon className="h-6 w-6 text-primary mr-2" />
              <h2 className="text-xl font-semibold">Order Items</h2>
            </div>

            <div className="space-y-4">
              {cart.items.map((item) => (
                <div key={item._id} className="flex items-center space-x-4">
                  <img
                    src={item.product.images?.[0] || item.product.image || "/placeholder.svg"}
                    alt={item.product.title}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{item.product.title}</h3>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={processing || !selectedAddress}
              className="w-full bg-primary hover:bg-primary-dark text-white py-3 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? "Processing..." : "Place Order"}
            </button>

            <p className="text-xs text-gray-500 mt-4 text-center">
              By placing your order, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
