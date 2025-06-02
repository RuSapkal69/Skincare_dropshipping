import { useState } from "react"
import { useTheme } from "../hooks/useTheme"
import { CogIcon, BellIcon, ShieldCheckIcon, CurrencyDollarIcon, TruckIcon } from "@heroicons/react/24/outline"

const Settings = () => {
  const { theme, toggleTheme } = useTheme()
  const [activeTab, setActiveTab] = useState("general")
  const [settings, setSettings] = useState({
    general: {
      siteName: "SkinCare Admin",
      siteDescription: "Premium skincare products for all skin types",
      contactEmail: "admin@skincare.com",
      supportPhone: "+1 (555) 123-4567",
      timezone: "UTC",
      language: "en",
      currency: "USD",
    },
    notifications: {
      emailNotifications: true,
      orderNotifications: true,
      lowStockAlerts: true,
      customerMessages: true,
      marketingEmails: false,
      systemUpdates: true,
    },
    shipping: {
      freeShippingThreshold: 100,
      standardShippingRate: 10,
      expressShippingRate: 25,
      internationalShipping: true,
      processingTime: "1-2 business days",
      shippingRegions: ["US", "CA", "UK", "EU"],
    },
    payments: {
      paypalEnabled: true,
      stripeEnabled: true,
      codEnabled: true,
      bankTransferEnabled: false,
      taxRate: 10,
      currency: "USD",
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordExpiry: 90,
      loginAttempts: 5,
      ipWhitelist: "",
    },
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const tabs = [
    { id: "general", name: "General", icon: CogIcon },
    { id: "notifications", name: "Notifications", icon: BellIcon },
    { id: "shipping", name: "Shipping", icon: TruckIcon },
    { id: "payments", name: "Payments", icon: CurrencyDollarIcon },
    { id: "security", name: "Security", icon: ShieldCheckIcon },
  ]

  const handleSave = async (section) => {
    setLoading(true)
    setMessage("")

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setMessage(`${section.charAt(0).toUpperCase() + section.slice(1)} settings saved successfully!`)
      setTimeout(() => setMessage(""), 3000)
    } catch (error) {
      setMessage("Failed to save settings. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = (section, key, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        {message && (
          <div
            className={`px-4 py-2 rounded-lg ${message.includes("success") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
          >
            {message}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center ${
                      activeTab === tab.id ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {tab.name}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* General Settings */}
            {activeTab === "general" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">General Settings</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                    <input
                      type="text"
                      value={settings.general.siteName}
                      onChange={(e) => updateSetting("general", "siteName", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                    <input
                      type="email"
                      value={settings.general.contactEmail}
                      onChange={(e) => updateSetting("general", "contactEmail", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Support Phone</label>
                    <input
                      type="tel"
                      value={settings.general.supportPhone}
                      onChange={(e) => updateSetting("general", "supportPhone", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                    <select
                      value={settings.general.timezone}
                      onChange={(e) => updateSetting("general", "timezone", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="UTC">UTC</option>
                      <option value="EST">Eastern Time</option>
                      <option value="PST">Pacific Time</option>
                      <option value="GMT">Greenwich Mean Time</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                    <select
                      value={settings.general.language}
                      onChange={(e) => updateSetting("general", "language", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                    <select
                      value={settings.general.currency}
                      onChange={(e) => updateSetting("general", "currency", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="CAD">CAD - Canadian Dollar</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Site Description</label>
                  <textarea
                    value={settings.general.siteDescription}
                    onChange={(e) => updateSetting("general", "siteDescription", e.target.value)}
                    rows="3"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium">Dark Mode</h3>
                    <p className="text-sm text-gray-600">Toggle between light and dark theme</p>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      theme === "dark" ? "bg-primary" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        theme === "dark" ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <button
                  onClick={() => handleSave("general")}
                  disabled={loading}
                  className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save General Settings"}
                </button>
              </div>
            )}

            {/* Notifications Settings */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Notification Settings</h2>

                <div className="space-y-4">
                  {Object.entries(settings.notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-medium capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</h3>
                        <p className="text-sm text-gray-600">
                          {key === "emailNotifications" && "Receive email notifications for important events"}
                          {key === "orderNotifications" && "Get notified when new orders are placed"}
                          {key === "lowStockAlerts" && "Alert when product inventory is low"}
                          {key === "customerMessages" && "Notifications for customer inquiries"}
                          {key === "marketingEmails" && "Receive marketing and promotional emails"}
                          {key === "systemUpdates" && "System maintenance and update notifications"}
                        </p>
                      </div>
                      <button
                        onClick={() => updateSetting("notifications", key, !value)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          value ? "bg-primary" : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            value ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleSave("notifications")}
                  disabled={loading}
                  className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Notification Settings"}
                </button>
              </div>
            )}

            {/* Shipping Settings */}
            {activeTab === "shipping" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Shipping Settings</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Free Shipping Threshold ($)</label>
                    <input
                      type="number"
                      value={settings.shipping.freeShippingThreshold}
                      onChange={(e) => updateSetting("shipping", "freeShippingThreshold", Number(e.target.value))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Standard Shipping Rate ($)</label>
                    <input
                      type="number"
                      value={settings.shipping.standardShippingRate}
                      onChange={(e) => updateSetting("shipping", "standardShippingRate", Number(e.target.value))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Express Shipping Rate ($)</label>
                    <input
                      type="number"
                      value={settings.shipping.expressShippingRate}
                      onChange={(e) => updateSetting("shipping", "expressShippingRate", Number(e.target.value))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Processing Time</label>
                    <input
                      type="text"
                      value={settings.shipping.processingTime}
                      onChange={(e) => updateSetting("shipping", "processingTime", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium">International Shipping</h3>
                    <p className="text-sm text-gray-600">Enable shipping to international destinations</p>
                  </div>
                  <button
                    onClick={() =>
                      updateSetting("shipping", "internationalShipping", !settings.shipping.internationalShipping)
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.shipping.internationalShipping ? "bg-primary" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.shipping.internationalShipping ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <button
                  onClick={() => handleSave("shipping")}
                  disabled={loading}
                  className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Shipping Settings"}
                </button>
              </div>
            )}

            {/* Payment Settings */}
            {activeTab === "payments" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Payment Settings</h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium">PayPal</h3>
                      <p className="text-sm text-gray-600">Accept payments via PayPal</p>
                    </div>
                    <button
                      onClick={() => updateSetting("payments", "paypalEnabled", !settings.payments.paypalEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.payments.paypalEnabled ? "bg-primary" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.payments.paypalEnabled ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium">Stripe</h3>
                      <p className="text-sm text-gray-600">Accept credit/debit card payments</p>
                    </div>
                    <button
                      onClick={() => updateSetting("payments", "stripeEnabled", !settings.payments.stripeEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.payments.stripeEnabled ? "bg-primary" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.payments.stripeEnabled ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium">Cash on Delivery</h3>
                      <p className="text-sm text-gray-600">Allow customers to pay on delivery</p>
                    </div>
                    <button
                      onClick={() => updateSetting("payments", "codEnabled", !settings.payments.codEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.payments.codEnabled ? "bg-primary" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.payments.codEnabled ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tax Rate (%)</label>
                    <input
                      type="number"
                      value={settings.payments.taxRate}
                      onChange={(e) => updateSetting("payments", "taxRate", Number(e.target.value))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                    <select
                      value={settings.payments.currency}
                      onChange={(e) => updateSetting("payments", "currency", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="CAD">CAD - Canadian Dollar</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => handleSave("payments")}
                  disabled={loading}
                  className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Payment Settings"}
                </button>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Security Settings</h2>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                  </div>
                  <button
                    onClick={() => updateSetting("security", "twoFactorAuth", !settings.security.twoFactorAuth)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.security.twoFactorAuth ? "bg-primary" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.security.twoFactorAuth ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                    <input
                      type="number"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => updateSetting("security", "sessionTimeout", Number(e.target.value))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password Expiry (days)</label>
                    <input
                      type="number"
                      value={settings.security.passwordExpiry}
                      onChange={(e) => updateSetting("security", "passwordExpiry", Number(e.target.value))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Login Attempts</label>
                    <input
                      type="number"
                      value={settings.security.loginAttempts}
                      onChange={(e) => updateSetting("security", "loginAttempts", Number(e.target.value))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">IP Whitelist</label>
                  <textarea
                    value={settings.security.ipWhitelist}
                    onChange={(e) => updateSetting("security", "ipWhitelist", e.target.value)}
                    rows="3"
                    placeholder="Enter IP addresses separated by commas"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Comma-separated list of IP addresses allowed to access admin panel
                  </p>
                </div>

                <button
                  onClick={() => handleSave("security")}
                  disabled={loading}
                  className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Security Settings"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
