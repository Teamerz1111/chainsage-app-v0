"use client"

import { useWallet } from "@/contexts/wallet-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Settings, Bell, BarChart3, Shield, ArrowLeft, Home, Users, Activity, AlertTriangle, User } from "lucide-react"
import { WatchlistManagement } from "@/components/watchlist-management"
import Link from "next/link"
import { useState } from "react"

export function AdminDashboard() {
  const { address } = useWallet()
  const [activeSection, setActiveSection] = useState("overview")

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`
  }

  const sideNavItems = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "watchlist", label: "Watchlist", icon: Users },
    { id: "activity", label: "Activity", icon: Activity },
    { id: "alerts", label: "Alerts", icon: AlertTriangle },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  const bottomNavItems = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "watchlist", label: "Watchlist", icon: Users },
    { id: "alerts", label: "Alerts", icon: Bell },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyber-dark via-gray-900 to-black">
      {/* Header */}
      <div className="border-b border-cyber-cyan/20 bg-cyber-dark/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-cyber-cyan hover:bg-cyber-cyan/10">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="h-6 w-px bg-cyber-cyan/20" />
              <div>
                <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-sm text-gray-400">Connected: {address && formatAddress(address)}</p>
              </div>
            </div>
            <Badge variant="outline" className="border-cyber-green/30 text-cyber-green">
              <div className="w-2 h-2 bg-cyber-green rounded-full mr-2 animate-pulse" />
              Connected
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Side Navigation - Desktop */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:top-16 lg:z-50">
          <div className="flex flex-col flex-grow bg-cyber-dark/80 backdrop-blur-sm border-r border-cyber-cyan/20 overflow-y-auto">
            <div className="flex flex-col flex-grow pt-5 pb-4">
              <div className="flex items-center flex-shrink-0 px-4">
                <User className="w-8 h-8 text-cyber-cyan" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">Admin Panel</p>
                  <p className="text-xs text-gray-400">Blockchain Monitor</p>
                </div>
              </div>
              <nav className="mt-8 flex-1 px-2 space-y-1">
                {sideNavItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full transition-colors ${
                        activeSection === item.id
                          ? "bg-cyber-cyan/20 text-cyber-cyan border-r-2 border-cyber-cyan"
                          : "text-gray-300 hover:bg-cyber-cyan/10 hover:text-cyber-cyan"
                      }`}
                    >
                      <Icon className="mr-3 flex-shrink-0 h-5 w-5" />
                      {item.label}
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:pl-64 flex flex-col flex-1">
          <main className="flex-1 pb-20 lg:pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* Alert Settings */}
                <Card className="bg-cyber-dark/50 border-cyber-cyan/20 hover:border-cyber-cyan/40 transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Bell className="w-5 h-5 text-cyber-green" />
                      Alert Settings
                    </CardTitle>
                    <CardDescription>Configure your notification preferences</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Active Alerts</span>
                        <Badge variant="secondary">12</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Risk Threshold</span>
                        <Badge variant="outline" className="border-amber-400/30 text-amber-400">
                          Medium
                        </Badge>
                      </div>
                      <Button className="w-full mt-4 bg-cyber-green/20 border border-cyber-green/30 text-cyber-green hover:bg-cyber-green/30">
                        Configure Alerts
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Analytics */}
                <Card className="bg-cyber-dark/50 border-cyber-cyan/20 hover:border-cyber-cyan/40 transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <BarChart3 className="w-5 h-5 text-purple-400" />
                      Analytics
                    </CardTitle>
                    <CardDescription>View your monitoring statistics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Transactions Tracked</span>
                        <Badge variant="secondary">1,247</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Risks Detected</span>
                        <Badge variant="outline" className="border-red-400/30 text-red-400">
                          8
                        </Badge>
                      </div>
                      <Button className="w-full mt-4 bg-purple-400/20 border border-purple-400/30 text-purple-400 hover:bg-purple-400/30">
                        View Analytics
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Security Settings */}
                <Card className="bg-cyber-dark/50 border-cyber-cyan/20 hover:border-cyber-cyan/40 transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Shield className="w-5 h-5 text-amber-400" />
                      Security Settings
                    </CardTitle>
                    <CardDescription>Manage your account security</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">2FA Status</span>
                        <Badge variant="outline" className="border-cyber-green/30 text-cyber-green">
                          Enabled
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Session Timeout</span>
                        <Badge variant="secondary">24h</Badge>
                      </div>
                      <Button className="w-full mt-4 bg-amber-400/20 border border-amber-400/30 text-amber-400 hover:bg-amber-400/30">
                        Security Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="mb-8">
                <WatchlistManagement />
              </div>

              {/* Quick Actions */}
              <Card className="bg-cyber-dark/50 border-cyber-cyan/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Settings className="w-5 h-5 text-cyber-cyan" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription>Common administrative tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Button
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-center gap-2 border-cyber-green/30 text-cyber-green hover:bg-cyber-green/10 bg-transparent"
                    >
                      <Bell className="w-6 h-6" />
                      <span className="text-sm">Set Alert</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-center gap-2 border-purple-400/30 text-purple-400 hover:bg-purple-400/10 bg-transparent"
                    >
                      <BarChart3 className="w-6 h-6" />
                      <span className="text-sm">View Reports</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-center gap-2 border-amber-400/30 text-amber-400 hover:bg-amber-400/10 bg-transparent"
                    >
                      <Shield className="w-6 h-6" />
                      <span className="text-sm">Security Settings</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-center gap-2 border-cyber-cyan/30 text-cyber-cyan hover:bg-cyber-cyan/10 bg-transparent"
                    >
                      <Settings className="w-6 h-6" />
                      <span className="text-sm">Preferences</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-cyber-dark/95 backdrop-blur-sm border-t border-cyber-cyan/30 z-50 shadow-lg shadow-cyber-cyan/10">
        <div className="grid grid-cols-4 gap-1 px-4 py-3">
          {bottomNavItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => {
                  console.log("[v0] Bottom nav clicked:", item.id)
                  setActiveSection(item.id)
                }}
                className={`flex flex-col items-center justify-center py-3 px-2 rounded-lg transition-all duration-200 ${
                  activeSection === item.id
                    ? "bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/30"
                    : "text-gray-400 hover:text-cyber-cyan hover:bg-cyber-cyan/10 border border-transparent"
                }`}
              >
                <Icon className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
