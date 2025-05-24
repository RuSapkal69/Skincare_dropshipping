import { useState, useEffect } from "react"
import api from "../utils/api"
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  UsersIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline"

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dateRange, setDateRange] = useState("7d") // 7d, 30d, 90d, 1y
  const [selectedMetric, setSelectedMetric] = useState("revenue")

  useEffect(() => {
    fetchAnalytics()
  }, [dateRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      // Since we don't have a specific analytics endpoint, we'll use dashboard stats
      const response = await api.get("/api/admin/dashboard")

      if (response.data.success) {
        // Transform the data for analytics view
        const stats = response.data.stats
        setAnalytics({
          totalRevenue: stats.totalRevenue || 0,
          totalOrders: stats.totalOrders || 0,
          totalProducts: stats.totalProducts || 0,
          totalUsers: stats.totalUsers || 0,
          salesByDate: stats.salesByDate || [],
          recentOrders: stats.recentOrders || [],
          // Mock additional analytics data
          conversionRate: 3.2,
          averageOrderValue: stats.totalRevenue / (stats.totalOrders || 1),
          topCategories: [
            { name: "Moisturizers", sales: 45, revenue: 12500 },
            { name: "Serums", sales: 38, revenue: 9800 },
            { name: "Cleansers", sales: 32, revenue: 7200 },
            { name: "Masks", sales: 28, revenue: 6100 },
          ],
          customerSegments: [
            { segment: "New Customers", count: 156, percentage: 35 },
            { segment: "Returning Customers", count: 234, percentage: 52 },
            { segment: "VIP Customers", count: 58, percentage: 13 },
          ],
          trafficSources: [
            { source: "Organic Search", visitors: 2340, percentage: 45 },
            { source: "Social Media", visitors: 1560, percentage: 30 },
            { source: "Direct", visitors: 890, percentage: 17 },
            { source: "Email", visitors: 420, percentage: 8 },
          ],
        })
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
      setError("Failed to load analytics data")
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`
  }

  const getGrowthIcon = (growth) => {
    if (growth > 0) {
      return <TrendingUpIcon className="h-4 w-4 text-green-500" />
    } else if (growth < 0) {
      return <TrendingDownIcon className="h-4 w-4 text-red-500" />
    }
    return null
  }

  const getGrowthColor = (growth) => {
    if (growth > 0) return "text-green-600"
    if (growth < 0) return "text-red-600"
    return "text-gray-600"
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md h-64"></div>
            <div className="bg-white p-6 rounded-lg shadow-md h-64"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5 text-gray-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics?.totalRevenue || 0)}</p>
              <div className="flex items-center mt-2">
                {getGrowthIcon(12.5)}
                <span className={`text-sm ml-1 ${getGrowthColor(12.5)}`}>+12.5% from last period</span>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{analytics?.totalOrders || 0}</p>
              <div className="flex items-center mt-2">
                {getGrowthIcon(8.2)}
                <span className={`text-sm ml-1 ${getGrowthColor(8.2)}`}>+8.2% from last period</span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Order Value</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics?.averageOrderValue || 0)}</p>
              <div className="flex items-center mt-2">
                {getGrowthIcon(5.1)}
                <span className={`text-sm ml-1 ${getGrowthColor(5.1)}`}>+5.1% from last period</span>
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{formatPercentage(analytics?.conversionRate || 0)}</p>
              <div className="flex items-center mt-2">
                {getGrowthIcon(-2.1)}
                <span className={`text-sm ml-1 ${getGrowthColor(-2.1)}`}>-2.1% from last period</span>
              </div>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <UsersIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Sales Overview</h2>
          {analytics?.salesByDate?.length > 0 ? (
            <div className="space-y-4">
              {analytics.salesByDate.map((sale) => (
                <div key={sale._id} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{sale._id}</span>
                  <div className="flex items-center space-x-4">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${(sale.total / Math.max(...analytics.salesByDate.map((s) => s.total))) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-20 text-right">{formatCurrency(sale.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No sales data available</p>
          )}
        </div>

        {/* Top Categories */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Top Categories</h2>
          <div className="space-y-4">
            {analytics?.topCategories?.map((category, index) => (
              <div key={category.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{category.name}</p>
                    <p className="text-sm text-gray-600">{category.sales} sales</p>
                  </div>
                </div>
                <span className="font-medium">{formatCurrency(category.revenue)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Segments */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Customer Segments</h2>
          <div className="space-y-4">
            {analytics?.customerSegments?.map((segment) => (
              <div key={segment.segment} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{segment.segment}</p>
                  <p className="text-sm text-gray-600">{segment.count} customers</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${segment.percentage}%` }}></div>
                  </div>
                  <span className="text-sm font-medium w-12 text-right">{segment.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Traffic Sources</h2>
          <div className="space-y-4">
            {analytics?.trafficSources?.map((source) => (
              <div key={source.source} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{source.source}</p>
                  <p className="text-sm text-gray-600">{source.visitors.toLocaleString()} visitors</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${source.percentage}%` }}></div>
                  </div>
                  <span className="text-sm font-medium w-12 text-right">{source.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        {analytics?.recentOrders?.length > 0 ? (
          <div className="space-y-4">
            {analytics.recentOrders.map((order) => (
              <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {order.user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{order.user?.name} placed an order</p>
                    <p className="text-sm text-gray-600">Order #{order._id.slice(-8)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(order.totalPrice)}</p>
                  <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No recent activity</p>
        )}
      </div>
    </div>
  )
}

export default Analytics
