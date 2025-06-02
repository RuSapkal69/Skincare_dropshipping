import { useState, useEffect } from "react"
import { useAuth } from "../hooks/useAuth"
import api from "../utils/api"
import {
  UserIcon,
  EnvelopeIcon,
  KeyIcon,
  CameraIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline"

const Profile = () => {
  const { admin, logout } = useAuth()
  const [activeTab, setActiveTab] = useState("profile")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState("success")

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    username: "",
    role: "",
    lastLogin: "",
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  const [activityLog, setActivityLog] = useState([
    {
      id: 1,
      action: "Login",
      timestamp: new Date().toISOString(),
      ip: "192.168.1.1",
      userAgent: "Chrome 91.0.4472.124",
    },
    {
      id: 2,
      action: "Updated product",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      ip: "192.168.1.1",
      details: "Product #12345",
    },
    {
      id: 3,
      action: "Created order",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      ip: "192.168.1.1",
      details: "Order #67890",
    },
  ])

  useEffect(() => {
    if (admin) {
      setProfileData({
        name: admin.name || "",
        email: admin.email || "",
        username: admin.username || "",
        role: admin.role || "",
        lastLogin: admin.lastLogin || "",
      })
    }
  }, [admin])

  const showMessage = (text, type = "success") => {
    setMessage(text)
    setMessageType(type)
    setTimeout(() => setMessage(""), 5000)
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await api.put("/api/admin/me", {
        name: profileData.name,
        email: profileData.email,
        username: profileData.username,
      })

      if (response.data.success) {
        showMessage("Profile updated successfully!", "success")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      showMessage(error.response?.data?.message || "Failed to update profile", "error")
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage("New passwords do not match", "error")
      return
    }

    if (passwordData.newPassword.length < 6) {
      showMessage("Password must be at least 6 characters long", "error")
      return
    }

    setLoading(true)

    try {
      const response = await api.put("/api/admin/me", {
        currentPassword: passwordData.currentPassword,
        password: passwordData.newPassword,
      })

      if (response.data.success) {
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
        showMessage("Password changed successfully!", "success")
      }
    } catch (error) {
      console.error("Error changing password:", error)
      showMessage(error.response?.data?.message || "Failed to change password", "error")
    } finally {
      setLoading(false)
    }
  }

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Never"
    return new Date(dateString).toLocaleString()
  }

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        {message && (
          <div
            className={`flex items-center px-4 py-2 rounded-lg ${
              messageType === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {messageType === "success" ? (
              <CheckCircleIcon className="h-5 w-5 mr-2" />
            ) : (
              <ExclamationCircleIcon className="h-5 w-5 mr-2" />
            )}
            {message}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {getInitials(profileData.name || "Admin")}
              </div>
              <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50">
                <CameraIcon className="h-4 w-4 text-gray-600" />
              </button>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{profileData.name}</h3>
            <p className="text-sm text-gray-600">{profileData.email}</p>
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Role</p>
              <p className="font-medium capitalize">{profileData.role}</p>
            </div>
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Last Login</p>
              <p className="text-sm">{formatDate(profileData.lastLogin)}</p>
            </div>
          </div>

          {/* Navigation */}
          <div className="bg-white rounded-lg shadow-md p-4 mt-6">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center ${
                  activeTab === "profile" ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <UserIcon className="h-5 w-5 mr-3" />
                Profile Information
              </button>
              <button
                onClick={() => setActiveTab("password")}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center ${
                  activeTab === "password" ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <KeyIcon className="h-5 w-5 mr-3" />
                Change Password
              </button>
              <button
                onClick={() => setActiveTab("activity")}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center ${
                  activeTab === "activity" ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <EnvelopeIcon className="h-5 w-5 mr-3" />
                Activity Log
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Profile Information Tab */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Profile Information</h2>

                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData((prev) => ({ ...prev, name: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData((prev) => ({ ...prev, email: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                      <input
                        type="text"
                        value={profileData.username}
                        onChange={(e) => setProfileData((prev) => ({ ...prev, username: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                      <input
                        type="text"
                        value={profileData.role}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 cursor-not-allowed"
                        disabled
                      />
                      <p className="text-xs text-gray-500 mt-1">Role cannot be changed</p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg disabled:opacity-50"
                    >
                      {loading ? "Updating..." : "Update Profile"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Change Password Tab */}
            {activeTab === "password" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Change Password</h2>

                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("current")}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPasswords.current ? (
                          <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                        minLength="6"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("new")}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPasswords.new ? (
                          <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters long</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("confirm")}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPasswords.confirm ? (
                          <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg disabled:opacity-50"
                    >
                      {loading ? "Changing..." : "Change Password"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Activity Log Tab */}
            {activeTab === "activity" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Activity Log</h2>

                <div className="space-y-4">
                  {activityLog.map((activity) => (
                    <div key={activity.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">{activity.action}</h3>
                          {activity.details && <p className="text-sm text-gray-600">{activity.details}</p>}
                          <p className="text-xs text-gray-500 mt-1">IP: {activity.ip}</p>
                          {activity.userAgent && <p className="text-xs text-gray-500">Browser: {activity.userAgent}</p>}
                        </div>
                        <span className="text-sm text-gray-500">{formatDate(activity.timestamp)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center">
                  <button className="text-primary hover:text-primary-dark text-sm font-medium">
                    Load More Activity
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
