import { Link } from "react-router-dom"

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-r from-primary to-primary-dark text-white">
      <div className="absolute inset-0 bg-black opacity-20"></div>
      <div className="relative container mx-auto px-4 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Discover Your
              <span className="block text-primary-light">Perfect Skin</span>
            </h1>
            <p className="text-xl mb-8 text-gray-100">
              Premium skincare products for all skin types. Transform your routine with our carefully curated collection
              of effective, science-backed formulations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/products"
                className="bg-white text-primary px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-center"
              >
                Shop Now
              </Link>
              <Link
                to="/about"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-primary transition-colors text-center"
              >
                Learn More
              </Link>
            </div>
          </div>
          <div className="hidden lg:block">
            <img
              src="/placeholder.svg?height=500&width=600"
              alt="Skincare Products"
              className="w-full h-auto rounded-lg shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
