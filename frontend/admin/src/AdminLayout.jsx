import { useEffect } from "react"
import { Outlet, useNavigate, useLocation } from "react-router-dom"
import Sidebar from "./components/layout/Sidebar"
import Header from "./components/layout/Header"
import Footer from "./components/layout/Footer"
import { useAuth } from "./hooks/useAuth"

const AdminLayout = () => {
  const { isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Check if admin is authenticated
    const checkAuth = async () => {
      if (!loading && !isAuthenticated) {
        // Redirect to login page with return URL
        navigate(`/admin/login?returnUrl=${encodeURIComponent(location.pathname)}`, { replace: true })
      }
    }

    checkAuth()
  }, [isAuthenticated, loading, navigate, location.pathname])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Don't render the admin layout if not authenticated
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <Sidebar />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  )
}

export default AdminLayout
