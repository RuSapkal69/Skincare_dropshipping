import { Link } from "react-router-dom"

const FeaturedCategories = () => {
  const categories = [
    {
      name: "Moisturizers",
      description: "Hydrate and nourish your skin",
      image: "/placeholder.svg?height=300&width=400",
      link: "/category/moisturizers",
    },
    {
      name: "Cleansers",
      description: "Gentle cleansing for all skin types",
      image: "/placeholder.svg?height=300&width=400",
      link: "/category/cleansers",
    },
    {
      name: "Serums",
      description: "Targeted treatments for specific concerns",
      image: "/placeholder.svg?height=300&width=400",
      link: "/category/serums",
    },
    {
      name: "Masks",
      description: "Intensive care for instant results",
      image: "/placeholder.svg?height=300&width=400",
      link: "/category/masks",
    },
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Shop by Category</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our carefully curated categories to find the perfect products for your skincare routine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.name}
              to={category.link}
              className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="aspect-w-4 aspect-h-3 overflow-hidden">
                <img
                  src={category.image || "/placeholder.svg"}
                  alt={category.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                <p className="text-gray-600">{category.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturedCategories
