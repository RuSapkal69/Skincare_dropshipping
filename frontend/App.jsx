import { Routes, Route, Navigate } from "react-router-dom"
import ClientLayout from "./client/ClientLayout"
import AdminLayout from "./admin/AdminLayout"
import AdminLogin from "./admin/pages/Login"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

// Client Pages
import Home from "./client/pages/Home"
import ProductDetail from "./client/pages/ProductDetail"
import Cart from "./client/pages/Cart"
import Checkout from "./client/pages/Checkout"
import Login from "./client/pages/Login"
import Register from "./client/pages/Register"
import UserProfile from "./client/pages/UserProfile"
import OrderHistory from "./client/pages/OrderHistory"
import OrderDetail from "./client/pages/OrderDetail"

// Admin Pages
import Dashboard from "./admin/pages/Dashboard"
import Products from "./admin/pages/Products"
import Orders from "./admin/pages/Orders"
import Analytics from "./admin/pages/Analytics"
import Settings from "./admin/pages/Settings"
import Profile from "./admin/pages/Profile"

// Auth Provider for Admin
import { AuthProvider } from "./admin/context/AuthContext"

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Client Routes */}
        <Route path="/" element={<ClientLayout />}>
          <Route index element={<Home />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="profile" element={<UserProfile />} />
          <Route path="orders" element={<OrderHistory />} />
          <Route path="order/:id" element={<OrderDetail />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </AuthProvider>
  )
}

export default App
