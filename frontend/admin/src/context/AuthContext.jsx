import { createContext, useState, useEffect } from "react"
import api from "../utils/api"

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Check if admin is logged in on initial load
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem("admin_token")

        if (!token) {
          setLoading(false)
          return
        }

        // Set token in axios headers
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`

        // Get admin profile
        const response = await api.get("/api/admin/me")

        if (response.data.success) {
          setAdmin(response.data.admin)
        } else {
          localStorage.removeItem("admin_token")
          delete api.defaults.headers.common["Authorization"]
        }
      } catch (error) {
        console.error("Auth check error:", error)
        localStorage.removeItem("admin_token")
        delete api.defaults.headers.common["Authorization"]
      } finally {
        setLoading(false)
      }
    }

    checkLoggedIn()
  }, [])

  // Login with username and password
  const login = async (username, password) => {
    try {
      setLoading(true)
      setError(null)

      const response = await api.post("/api/admin/login", {
        username,
        password,
      })

      if (response.data.success) {
        const { token, admin } = response.data

        // Save token to localStorage
        localStorage.setItem("admin_token", token)

        // Set token in axios headers
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`

        // Set admin in state
        setAdmin(admin)

        return true
      }
    } catch (error) {
      setError(error.response?.data?.message || "Login failed")
      return false
    } finally {
      setLoading(false)
    }
  }

  // Login with OTP
  const requestOTP = async (email) => {
    try {
      setLoading(true)
      setError(null)

      const response = await api.post("/api/admin/login/otp/generate", {
        email,
      })

      return response.data.success
    } catch (error) {
      setError(error.response?.data?.message || "Failed to send OTP")
      return false
    } finally {
      setLoading(false)
    }
  }

  const verifyOTP = async (email, otp) => {
    try {
      setLoading(true)
      setError(null)

      const response = await api.post("/api/admin/login/otp/verify", {
        email,
        otp,
      })

      if (response.data.success) {
        const { token, admin } = response.data

        // Save token to localStorage
        localStorage.setItem("admin_token", token)

        // Set token in axios headers
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`

        // Set admin in state
        setAdmin(admin)

        return true
      }
    } catch (error) {
      setError(error.response?.data?.message || "OTP verification failed")
      return false
    } finally {
      setLoading(false)
    }
  }

  // Logout
  const logout = () => {
    localStorage.removeItem("admin_token")
    delete api.defaults.headers.common["Authorization"]
    setAdmin(null)
  }

  return (
    <AuthContext.Provider
      value={{
        admin,
        loading,
        error,
        login,
        requestOTP,
        verifyOTP,
        logout,
        isAuthenticated: !!admin,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
