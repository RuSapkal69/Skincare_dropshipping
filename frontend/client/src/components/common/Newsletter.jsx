"use client"

import { useState } from "react"

const Newsletter = () => {
  const [email, setEmail] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubscribed(true)
      setLoading(false)
      setEmail("")
    }, 1000)
  }

  if (isSubscribed) {
    return (
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-2">Thank You!</h3>
            <p className="text-primary-light">You've successfully subscribed to our newsletter.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-primary text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Stay Updated</h2>
          <p className="text-xl mb-8 text-primary-light">
            Subscribe to our newsletter for the latest skincare tips, product launches, and exclusive offers.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {loading ? "Subscribing..." : "Subscribe"}
            </button>
          </form>

          <p className="text-sm text-primary-light mt-4">We respect your privacy. Unsubscribe at any time.</p>
        </div>
      </div>
    </section>
  )
}

export default Newsletter
