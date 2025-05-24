import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import axios from "axios"
import { ArrowLeftIcon, TruckIcon, CheckCircleIcon, ClockIcon, XCircleIcon } from "@heroicons/react/24/outline"

const OrderDetail = () => {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true)

        const response = await axios.get(`/api/orders/${id}`)

        if (response.data.success) {
          setOrder(response.data.order)
        } else {
          setError("Order not found")
        }
      } catch (error) {
        console.error("Error fetching order:", error)
        setError(error.response?.data?.message || "Failed to load order")
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [id])

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <ClockIcon className="h-6 w-6 text-yellow-500" />
      case "processing":
        return <ClockIcon className="h-6 w-6 text-blue-500" />
      case "shipped":
        return <TruckIcon className="h-6 w-6 text-purple-500" />
      case "delivered":
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />
      case "cancelled":
        return <XCircleIcon className="h-6 w-6 text-red-500" />
      default:
        return <ClockIcon className="h-6 w-6 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "shipped":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getOrderProgress = (status) => {
    const steps = ["pending", "processing", "shipped", "delivered"]
    const currentIndex = steps.indexOf(status)
    return currentIndex >= 0 ? currentIndex + 1 : 0
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-8">{error || "The order you're looking for doesn't exist."}</p>
          <Link
            to="/orders"
            className="inline-flex items-center bg-primary text-white px-6 py-3 rounded-md hover:bg-primary-dark"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Orders
          </Link>
        </div>
      </div>
    )
  }

  const orderProgress = getOrderProgress(order.status)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/orders" className="inline-flex items-center text-primary hover:text-primary-dark mb-4">
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Orders
        </Link>
        <h1 className="text-3xl font-bold">Order #{order._id.slice(-8)}</h1>
        <p className="text-gray-600">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Order Status</h2>
              <div
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                  order.status,
                )}`}
              >
                {getStatusIcon(order.status)}
                <span className="ml-2 capitalize">{order.status}</span>
              </div>
            </div>

            {/* Progress Bar */}
            {order.status !== "cancelled" && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Order Progress</span>
                  <span className="text-sm text-gray-600">{orderProgress}/4 steps</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(orderProgress / 4) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-600 mt-2">
                  <span>Pending</span>
                  <span>Processing</span>
                  <span>Shipped</span>
                  <span>Delivered</span>
                </div>
              </div>
            )}

            {/* Tracking Information */}
            {order.trackingNumber && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">Tracking Information</h3>
                <p className="text-blue-800">
                  <span className="font-medium">Tracking Number:</span> {order.trackingNumber}
                </p>
                {order.trackingUrl && (
                  <a
                    href={order.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-blue-600 hover:text-blue-800 underline"
                  >
                    Track your package →
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.orderItems.map((item, index) => (
                <div key={index} className="flex items-center space-x-4 py-4 border-b last:border-b-0">
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    {item.variant && <p className="text-sm text-gray-600">Variant: {item.variant}</p>}
                    <p className="text-sm text-gray-600">
                      ${item.price.toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
            <div className="text-gray-700">
              <p className="font-medium">{order.shippingAddress.name}</p>
              <p>{order.shippingAddress.address}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
              <p className="mt-2">
                <span className="font-medium">Phone:</span> {order.shippingAddress.phone}
              </p>
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
                <span>${order.itemsPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>${order.shippingPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${order.taxPrice.toFixed(2)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${order.totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Payment Method</span>
                <span>{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Status</span>
                <span className={order.isPaid ? "text-green-600" : "text-red-600"}>
                  {order.isPaid ? "Paid" : "Unpaid"}
                </span>
              </div>
              {order.isPaid && order.paidAt && (
                <div className="flex justify-between">
                  <span>Paid On</span>
                  <span>{new Date(order.paidAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {order.status === "pending" && (
              <div className="mt-6">
                <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md">
                  Cancel Order
                </button>
              </div>
            )}

            {order.status === "delivered" && (
              <div className="mt-6">
                <button className="w-full bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-md">
                  Reorder Items
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetail
