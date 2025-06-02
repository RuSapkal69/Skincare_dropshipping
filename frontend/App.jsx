import { Routes, Route, Navigate } from "react-router-dom"
import ClientLayout from "./client/src/ClientLayout"
import AdminLayout from "./admin/src/AdminLayout"
import AdminLogin from "./admin/src/pages/Login"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

// Client Pages
import Home from "./client/src/pages/Home"
import ProductDetail from "./client/src/pages/ProductDetail"
import Cart from "./client/src/pages/Cart"
import Checkout from "./client/src/pages/Checkout"
import Login from "./client/src/pages/Login"
import Register from "./client/src/pages/Register"
import UserProfile from "./client/src/pages/UserProfile"
import OrderHistory from "./client/src/pages/OrderHistory"
import OrderDetail from "./client/src/pages/OrderDetail"

// Admin Pages
import Dashboard from "./admin/src/pages/Dashboard"
import Products from "./admin/src/pages/Products"
import Orders from "./admin/src/pages/Orders"
import Analytics from "./admin/src/pages/Analytics"
import Settings from "./admin/src/pages/Settings"
import Profile from "./admin/src/pages/Profile"

// Auth Provider for Admin
import { AuthProvider } from "./admin/src/context/AuthContext"

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
