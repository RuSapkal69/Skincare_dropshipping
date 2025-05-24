"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { UserIcon, MapPinIcon, PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline"

const UserProfile = () => {
  const [user, setUser] = useState(null)
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("profile")
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  const navigate = useNavigate()

  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [addressForm, setAddressForm] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    phone: "",
    isDefault: false,
  })

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)

        // Check if user is logged in
        const token = localStorage.getItem("token")
        if (!token) {
          navigate("/login")
          return
        }

        // Fetch user profile
        const userResponse = await axios.get("/api/users/profile")
        if (userResponse.data.success) {
          setUser(userResponse.data.user)
          setProfileForm({
            name: userResponse.data.user.name,
            email: userResponse.data.user.email,
            phone: userResponse.data.user.phone || "",
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          })
        }

        // Fetch addresses
        const addressResponse = await axios.get("/api/users/addresses")
        if (addressResponse.data.success) {
          setAddresses(addressResponse.data.addresses)
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
        if (error.response?.status === 401) {
          localStorage.removeItem("token")
          navigate("/login")
        } else {
          setError("Failed to load user data")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [navigate])

  const handleProfileUpdate = async (e) => {
    e.preventDefault()

    if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmPassword) {
      setError("New passwords do not match")
      return
    }

    try {
      setError(null)

      const updateData = {
        name: profileForm.name,
        email: profileForm.email,
        phone: profileForm.phone,
      }

      if (profileForm.newPassword) {
        updateData.password = profileForm.newPassword
      }

      const response = await axios.put("/api/users/profile", updateData)

      if (response.data.success) {
        setUser(response.data.user)
        setProfileForm((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }))
        alert("Profile updated successfully!")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      setError(error.response?.data?.message || "Failed to update profile")
    }
  }

  const handleAddressSubmit = async (e) => {
    e.preventDefault()

    try {
      setError(null)

      if (editingAddress) {
        // Update existing address
        const response = await axios.put(`/api/users/addresses/${editingAddress._id}`, addressForm)
        if (response.data.success) {
          setAddresses(response.data.addresses)
        }
      } else {
        // Add new address
        const response = await axios.post("/api/users/addresses", addressForm)
        if (response.data.success) {
          setAddresses(response.data.addresses)
        }
      }

      setShowAddressForm(false)
      setEditingAddress(null)
      setAddressForm({
        name: "",
        address: "",
        city: "",
        state: "",
        postalCode: "",
        country: "India",
        phone: "",
        isDefault: false,
      })
    } catch (error) {
      console.error("Error saving address:", error)
      setError(error.response?.data?.message || "Failed to save address")
    }
  }

  const handleDeleteAddress = async (addressId) => {
    if (!confirm("Are you sure you want to delete this address?")) {
      return
    }

    try {
      const response = await axios.delete(`/api/users/addresses/${addressId}`)
      if (response.data.success) {
        setAddresses(response.data.addresses)
      }
    } catch (error) {
      console.error("Error deleting address:", error)
      setError(error.response?.data?.message || "Failed to delete address")
    }
  }

  const startEditAddress = (address) => {
    setEditingAddress(address)
    setAddressForm({
      name: address.name,
      address: address.address,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      phone: address.phone,
      isDefault: address.isDefault,
    })
    setShowAddressForm(true)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="md:col-span-3 h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="ml-3">
                <p className="font-medium">{user?.name}</p>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
            </div>

            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                  activeTab === "profile" ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <UserIcon className="h-5 w-5 inline mr-2" />
                Profile
              </button>
              <button
                onClick={() => setActiveTab("addresses")}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                  activeTab === "addresses" ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <MapPinIcon className="h-5 w-5 inline mr-2" />
                Addresses
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-3">
          {activeTab === "profile" && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-6">Profile Information</h2>

              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium mb-4">Change Password</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                      <input
                        type="password"
                        value={profileForm.newPassword}
                        onChange={(e) => setProfileForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                        placeholder="Leave blank to keep current password"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        value={profileForm.confirmPassword}
                        onChange={(e) => setProfileForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button type="submit" className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-md">
                    Update Profile
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "addresses" && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Saved Addresses</h2>
                <button
                  onClick={() => {
                    setShowAddressForm(true)
                    setEditingAddress(null)
                    setAddressForm({
                      name: "",
                      address: "",
                      city: "",
                      state: "",
                      postalCode: "",
                      country: "India",
                      phone: "",
                      isDefault: false,
                    })
                  }}
                  className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md flex items-center"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add Address
                </button>
              </div>

              {showAddressForm && (
                <div className="mb-6 p-4 border border-gray-200 rounded-lg">
                  <h3 className="text-lg font-medium mb-4">{editingAddress ? "Edit Address" : "Add New Address"}</h3>

                  <form onSubmit={handleAddressSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                          type="text"
                          value={addressForm.name}
                          onChange={(e) => setAddressForm((prev) => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                          type="tel"
                          value={addressForm.phone}
                          onChange={(e) => setAddressForm((prev) => ({ ...prev, phone: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <textarea
                        value={addressForm.address}
                        onChange={(e) => setAddressForm((prev) => ({ ...prev, address: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                        rows="3"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <input
                          type="text"
                          value={addressForm.city}
                          onChange={(e) => setAddressForm((prev) => ({ ...prev, city: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                        <input
                          type="text"
                          value={addressForm.state}
                          onChange={(e) => setAddressForm((prev) => ({ ...prev, state: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                        <input
                          type="text"
                          value={addressForm.postalCode}
                          onChange={(e) => setAddressForm((prev) => ({ ...prev, postalCode: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isDefault"
                        checked={addressForm.isDefault}
                        onChange={(e) => setAddressForm((prev) => ({ ...prev, isDefault: e.target.checked }))}
                        className="mr-2"
                      />
                      <label htmlFor="isDefault" className="text-sm text-gray-700">
                        Set as default address
                      </label>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md"
                      >
                        {editingAddress ? "Update Address" : "Add Address"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddressForm(false)
                          setEditingAddress(null)
                        }}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {addresses.length === 0 ? (
                <div className="text-center py-8">
                  <MapPinIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No addresses saved yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {addresses.map((address) => (
                    <div
                      key={address._id}
                      className={`border rounded-lg p-4 ${
                        address.isDefault ? "border-primary bg-primary/5" : "border-gray-200"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center mb-2">
                            <p className="font-medium">{address.name}</p>
                            {address.isDefault && (
                              <span className="ml-2 bg-primary text-white text-xs px-2 py-1 rounded">Default</span>
                            )}
                          </div>
                          <p className="text-gray-600">{address.address}</p>
                          <p className="text-gray-600">
                            {address.city}, {address.state} {address.postalCode}
                          </p>
                          <p className="text-gray-600">{address.phone}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => startEditAddress(address)}
                            className="text-primary hover:text-primary-dark"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(address._id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserProfile
