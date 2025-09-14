"use client"

import React from "react"
import { useWallet } from "@/contexts/wallet-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Settings,
  Bell,
  BarChart3,
  Shield,
  ArrowLeft,
  Home,
  Users,
  Activity,
  AlertTriangle,
  User,
  MessageCircle,
  Send,
  X,
  Mail,
  Plus,
  Trash2,
  Wallet,
  Image,
  DollarSign,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react"
import { WatchlistManagement } from "@/components/watchlist-management"
import Link from "next/link"
import { useState, useEffect } from "react"
import { apiService } from "@/lib/api"

export function AdminDashboard() {
  const { address } = useWallet()
  const [activeSection, setActiveSection] = useState("overview")
  const [isChatboxOpen, setIsChatboxOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI assistant. How can I help you with blockchain monitoring today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ])
  const [newMessage, setNewMessage] = useState("")
  
  // Settings state
  const [watchlists, setWatchlists] = useState({
    tokens: [],
    wallets: [],
    nfts: []
  })
  const [thresholds, setThresholds] = useState({
    priceChange: 10,
    volumeChange: 50,
    transactionAmount: 1000
  })
  const [notifications, setNotifications] = useState({
    email: true,
    telegram: false,
    discord: true
  })
  const [newWatchlistItem, setNewWatchlistItem] = useState({
    type: 'tokens',
    value: ''
  })
  
  // Modal and API state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [monitoringStatus, setMonitoringStatus] = useState(null)
  
  // Load monitoring status on component mount
  useEffect(() => {
    loadMonitoringStatus()
  }, [])
  
  const loadMonitoringStatus = async () => {
    try {
      const [statusResponse, walletsResponse] = await Promise.all([
        apiService.getMonitoringStatus(),
        apiService.getMonitoredWallets()
      ])
      
      if (statusResponse.data) {
        setMonitoringStatus(statusResponse.data)
      }
      
      if (walletsResponse.data && walletsResponse.data.wallets) {
        setWatchlists(prev => ({
          ...prev,
          wallets: walletsResponse.data.wallets.map(wallet => ({
            id: wallet.address,
            value: wallet.address,
            threshold: wallet.threshold,
            status: wallet.status,
            addedAt: wallet.addedAt
          }))
        }))
      }
    } catch (err) {
      console.error('Failed to load monitoring data:', err)
    }
  }
  
  const handleAddWatchlistItem = async () => {
    if (!newWatchlistItem.value.trim()) {
      setError('Please enter a valid address or identifier')
      return
    }
    
    setIsLoading(true)
    setError('')
    setSuccess('')
    
    try {
      if (newWatchlistItem.type === 'wallets') {
        // Use the backend API for wallet monitoring
        const response = await apiService.startWalletMonitoring(
          newWatchlistItem.value.trim(), 
          thresholds.transactionAmount
        )
        
        if (response.error) {
          throw new Error(response.error)
        }
        
        setSuccess(`Successfully added wallet ${newWatchlistItem.value} to monitoring`)
        
        // Add to local state
        setWatchlists(prev => ({
          ...prev,
          [newWatchlistItem.type]: [
            ...prev[newWatchlistItem.type], 
            { id: Date.now(), value: newWatchlistItem.value.trim() }
          ]
        }))
      } else {
        // For tokens and NFTs, add to local state (extend with API later)
        setWatchlists(prev => ({
          ...prev,
          [newWatchlistItem.type]: [
            ...prev[newWatchlistItem.type], 
            { id: Date.now(), value: newWatchlistItem.value.trim() }
          ]
        }))
        setSuccess(`Successfully added ${newWatchlistItem.type.slice(0, -1)} to watchlist`)
      }
      
      setNewWatchlistItem(prev => ({ ...prev, value: '' }))
      setIsAddModalOpen(false)
      
    } catch (err) {
      setError(err.message || 'Failed to add item to watchlist')
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleRemoveWatchlistItem = async (type, item) => {
    if (type === 'wallets') {
      try {
        setIsLoading(true)
        const response = await apiService.stopWalletMonitoring(item.value)
        if (response.error) {
          throw new Error(response.error)
        }
        setSuccess(`Stopped monitoring wallet ${item.value}`)
      } catch (err) {
        setError(err.message || 'Failed to stop wallet monitoring')
        setIsLoading(false)
        return
      } finally {
        setIsLoading(false)
      }
    }
    
    setWatchlists(prev => ({
      ...prev,
      [type]: prev[type].filter(i => i.id !== item.id)
    }))
  }
  
  const clearMessages = () => {
    setError('')
    setSuccess('')
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`
  }

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const userMessage = {
      id: messages.length + 1,
      text: newMessage,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setNewMessage("")

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        text: "I understand you're asking about blockchain monitoring. Let me help you with that. What specific aspect would you like to explore?",
        sender: "ai",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])
    }, 1000)
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
    { id: "chat", label: "AI Chat", icon: MessageCircle, action: () => setIsChatboxOpen(!isChatboxOpen) },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyber-dark via-gray-900 to-black">
      {/* Header */}
      <div className="border-b border-cyber-cyan/20 bg-cyber-dark/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-cyber-cyan hover:bg-cyber-cyan/10">
                  <ArrowLeft className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Back to Dashboard</span>
                </Button>
              </Link>
              <div className="hidden sm:block h-6 w-px bg-cyber-cyan/20" />
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-xs sm:text-sm text-gray-400 hidden sm:block">Connected: {address && formatAddress(address)}</p>
              </div>
            </div>
            <Badge variant="outline" className="border-cyber-green/30 text-cyber-green text-xs sm:text-sm">
              <div className="w-2 h-2 bg-cyber-green rounded-full mr-1 sm:mr-2 animate-pulse" />
              <span className="hidden sm:inline">Connected</span>
              <span className="sm:hidden">●</span>
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
              {/* Mobile Section Header */}
              <div className="lg:hidden mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {activeSection === "overview" && "Overview"}
                  {activeSection === "watchlist" && "Watchlist Management"}
                  {activeSection === "activity" && "Activity Feed"}
                  {activeSection === "alerts" && "Alert Settings"}
                  {activeSection === "analytics" && "Analytics"}
                  {activeSection === "settings" && "Settings"}
                </h2>
              </div>

              {/* Overview Section */}
              {activeSection === "overview" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
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
              )}

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
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <Button
                      variant="outline"
                      className="h-auto p-3 sm:p-4 flex flex-col items-center gap-1 sm:gap-2 border-cyber-green/30 text-cyber-green hover:bg-cyber-green/10 bg-transparent"
                    >
                      <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
                      <span className="text-xs sm:text-sm">Set Alert</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto p-3 sm:p-4 flex flex-col items-center gap-1 sm:gap-2 border-purple-400/30 text-purple-400 hover:bg-purple-400/10 bg-transparent"
                    >
                      <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />
                      <span className="text-xs sm:text-sm">Reports</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto p-3 sm:p-4 flex flex-col items-center gap-1 sm:gap-2 border-amber-400/30 text-amber-400 hover:bg-amber-400/10 bg-transparent"
                    >
                      <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
                      <span className="text-xs sm:text-sm">Security</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto p-3 sm:p-4 flex flex-col items-center gap-1 sm:gap-2 border-cyber-cyan/30 text-cyber-cyan hover:bg-cyber-cyan/10 bg-transparent"
                    >
                      <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
                      <span className="text-xs sm:text-sm">Settings</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Watchlist Section */}
              {activeSection === "watchlist" && (
                <div className="mb-8">
                  <WatchlistManagement />
                </div>
              )}

              {/* Activity Section */}
              {activeSection === "activity" && (
                <Card className="bg-cyber-dark/50 border-cyber-cyan/20">
                  <CardHeader>
                    <CardTitle className="text-white">Activity Feed</CardTitle>
                    <CardDescription>Recent blockchain activity and transactions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400">Activity feed integration coming soon...</p>
                  </CardContent>
                </Card>
              )}

              {/* Alerts Section */}
              {activeSection === "alerts" && (
                <Card className="bg-cyber-dark/50 border-cyber-cyan/20">
                  <CardHeader>
                    <CardTitle className="text-white">Alert Configuration</CardTitle>
                    <CardDescription>Manage your notification settings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400">Alert configuration panel coming soon...</p>
                  </CardContent>
                </Card>
              )}

              {/* Analytics Section */}
              {activeSection === "analytics" && (
                <Card className="bg-cyber-dark/50 border-cyber-cyan/20">
                  <CardHeader>
                    <CardTitle className="text-white">Analytics Dashboard</CardTitle>
                    <CardDescription>Comprehensive monitoring analytics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400">Analytics dashboard coming soon...</p>
                  </CardContent>
                </Card>
              )}

              {/* Settings Section */}
              {activeSection === "settings" && (
                <div className="space-y-6">
                  {/* Alert Preferences */}
                  <Card className="bg-cyber-dark/50 border-cyber-cyan/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Bell className="w-5 h-5 text-cyber-green" />
                        Alert Preferences
                      </CardTitle>
                      <CardDescription>Configure your notification settings and preferences</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Notification Channels */}
                      <div>
                        <h3 className="text-lg font-medium text-white mb-4">Notification Channels</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Mail className="w-4 h-4 text-blue-400" />
                              <Label htmlFor="email-notifications" className="text-white">Email Notifications</Label>
                            </div>
                            <Switch
                              id="email-notifications"
                              checked={notifications.email}
                              onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email: checked }))}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Send className="w-4 h-4 text-cyan-400" />
                              <Label htmlFor="telegram-notifications" className="text-white">Telegram Notifications</Label>
                            </div>
                            <Switch
                              id="telegram-notifications"
                              checked={notifications.telegram}
                              onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, telegram: checked }))}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <MessageCircle className="w-4 h-4 text-purple-400" />
                              <Label htmlFor="discord-notifications" className="text-white">Discord Notifications</Label>
                            </div>
                            <Switch
                              id="discord-notifications"
                              checked={notifications.discord}
                              onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, discord: checked }))}
                            />
                          </div>
                        </div>
                      </div>

                      <Separator className="bg-cyber-cyan/20" />

                      {/* Custom Thresholds */}
                      <div>
                        <h3 className="text-lg font-medium text-white mb-4">Alert Thresholds</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="price-threshold" className="text-white">Price Change (%)</Label>
                            <Input
                              id="price-threshold"
                              type="number"
                              value={thresholds.priceChange}
                              onChange={(e) => setThresholds(prev => ({ ...prev, priceChange: Number(e.target.value) }))}
                              className="bg-cyber-dark/30 border-cyber-cyan/30 text-white"
                              placeholder="10"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="volume-threshold" className="text-white">Volume Change (%)</Label>
                            <Input
                              id="volume-threshold"
                              type="number"
                              value={thresholds.volumeChange}
                              onChange={(e) => setThresholds(prev => ({ ...prev, volumeChange: Number(e.target.value) }))}
                              className="bg-cyber-dark/30 border-cyber-cyan/30 text-white"
                              placeholder="50"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="transaction-threshold" className="text-white">Transaction Amount ($)</Label>
                            <Input
                              id="transaction-threshold"
                              type="number"
                              value={thresholds.transactionAmount}
                              onChange={(e) => setThresholds(prev => ({ ...prev, transactionAmount: Number(e.target.value) }))}
                              className="bg-cyber-dark/30 border-cyber-cyan/30 text-white"
                              placeholder="1000"
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Watchlists Management */}
                  <Card className="bg-cyber-dark/50 border-cyber-cyan/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Users className="w-5 h-5 text-purple-400" />
                        Watchlists Management
                      </CardTitle>
                      <CardDescription>Manage your tokens, wallets, and NFTs watchlists</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Add New Item */}
                      <div className="flex gap-2">
                        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              className="bg-cyber-green/20 border border-cyber-green/30 text-cyber-green hover:bg-cyber-green/30"
                              onClick={clearMessages}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add to Watchlist
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-cyber-dark border-cyber-cyan/30 text-white">
                            <DialogHeader>
                              <DialogTitle className="text-cyber-cyan">Add to Watchlist</DialogTitle>
                              <DialogDescription className="text-gray-400">
                                Add tokens, wallets, or NFTs to your monitoring watchlist
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4">
                              {/* Error/Success Messages */}
                              {error && (
                                <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-500/30 rounded text-red-400">
                                  <AlertCircle className="w-4 h-4" />
                                  <span className="text-sm">{error}</span>
                                </div>
                              )}
                              
                              {success && (
                                <div className="flex items-center gap-2 p-3 bg-green-900/20 border border-green-500/30 rounded text-green-400">
                                  <CheckCircle className="w-4 h-4" />
                                  <span className="text-sm">{success}</span>
                                </div>
                              )}
                              
                              {/* Type Selection */}
                              <div className="space-y-2">
                                <Label className="text-white">Type</Label>
                                <Select value={newWatchlistItem.type} onValueChange={(value) => setNewWatchlistItem(prev => ({ ...prev, type: value }))}>
                                  <SelectTrigger className="bg-cyber-dark/30 border-cyber-cyan/30 text-white">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-cyber-dark border-cyber-cyan/30">
                                    <SelectItem value="tokens">Tokens</SelectItem>
                                    <SelectItem value="wallets">Wallets</SelectItem>
                                    <SelectItem value="nfts">NFTs</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              {/* Address/Identifier Input */}
                              <div className="space-y-2">
                                <Label className="text-white">
                                  {newWatchlistItem.type === 'tokens' && 'Token Address or Symbol'}
                                  {newWatchlistItem.type === 'wallets' && 'Wallet Address'}
                                  {newWatchlistItem.type === 'nfts' && 'NFT Collection'}
                                </Label>
                                <Input
                                  value={newWatchlistItem.value}
                                  onChange={(e) => setNewWatchlistItem(prev => ({ ...prev, value: e.target.value }))}
                                  placeholder={`Enter ${newWatchlistItem.type === 'tokens' ? 'token address or symbol' : newWatchlistItem.type === 'wallets' ? 'wallet address' : 'NFT collection'}`}
                                  className="bg-cyber-dark/30 border-cyber-cyan/30 text-white"
                                  disabled={isLoading}
                                />
                              </div>
                              
                              {/* Threshold Setting for Wallets */}
                              {newWatchlistItem.type === 'wallets' && (
                                <div className="space-y-2">
                                  <Label className="text-white">Alert Threshold ($)</Label>
                                  <Input
                                    type="number"
                                    value={thresholds.transactionAmount}
                                    onChange={(e) => setThresholds(prev => ({ ...prev, transactionAmount: Number(e.target.value) }))}
                                    className="bg-cyber-dark/30 border-cyber-cyan/30 text-white"
                                    placeholder="1000"
                                    disabled={isLoading}
                                  />
                                  <p className="text-xs text-gray-400">Transactions above this amount will trigger alerts</p>
                                </div>
                              )}
                            </div>
                            
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setIsAddModalOpen(false)}
                                disabled={isLoading}
                                className="border-gray-600 text-gray-300 hover:bg-gray-800"
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={handleAddWatchlistItem}
                                disabled={isLoading || !newWatchlistItem.value.trim()}
                                className="bg-cyber-green/20 border border-cyber-green/30 text-cyber-green hover:bg-cyber-green/30"
                              >
                                {isLoading ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Adding...
                                  </>
                                ) : (
                                  'Add to Watchlist'
                                )}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>

                      {/* Watchlist Categories */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Tokens */}
                        <div>
                          <h4 className="flex items-center gap-2 text-sm font-medium text-white mb-3">
                            <DollarSign className="w-4 h-4 text-amber-400" />
                            Tokens ({watchlists.tokens.length})
                          </h4>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {watchlists.tokens.length === 0 ? (
                              <p className="text-xs text-gray-400">No tokens added</p>
                            ) : (
                              watchlists.tokens.map((token) => (
                                <div key={token.id} className="flex items-center justify-between p-2 bg-cyber-dark/30 rounded border border-cyber-cyan/20">
                                  <span className="text-xs text-white truncate">{token.value}</span>
                                  <button
                                    onClick={() => handleRemoveWatchlistItem('tokens', token)}
                                    className="text-red-400 hover:text-red-300"
                                    disabled={isLoading}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        {/* Wallets */}
                        <div>
                          <h4 className="flex items-center gap-2 text-sm font-medium text-white mb-3">
                            <Wallet className="w-4 h-4 text-cyan-400" />
                            Wallets ({watchlists.wallets.length})
                          </h4>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {watchlists.wallets.length === 0 ? (
                              <p className="text-xs text-gray-400">No wallets added</p>
                            ) : (
                              watchlists.wallets.map((wallet) => (
                                <div key={wallet.id} className="flex items-center justify-between p-2 bg-cyber-dark/30 rounded border border-cyber-cyan/20">
                                  <span className="text-xs text-white truncate">{wallet.value}</span>
                                  <button
                                    onClick={() => handleRemoveWatchlistItem('wallets', wallet)}
                                    className="text-red-400 hover:text-red-300"
                                    disabled={isLoading}
                                  >
                                    {isLoading ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <Trash2 className="w-3 h-3" />
                                    )}
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        {/* NFTs */}
                        <div>
                          <h4 className="flex items-center gap-2 text-sm font-medium text-white mb-3">
                            <Image className="w-4 h-4 text-purple-400" />
                            NFTs ({watchlists.nfts.length})
                          </h4>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {watchlists.nfts.length === 0 ? (
                              <p className="text-xs text-gray-400">No NFTs added</p>
                            ) : (
                              watchlists.nfts.map((nft) => (
                                <div key={nft.id} className="flex items-center justify-between p-2 bg-cyber-dark/30 rounded border border-cyber-cyan/20">
                                  <span className="text-xs text-white truncate">{nft.value}</span>
                                  <button
                                    onClick={() => handleRemoveWatchlistItem('nfts', nft)}
                                    className="text-red-400 hover:text-red-300"
                                    disabled={isLoading}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Monitoring Status */}
                      {monitoringStatus && (
                        <div className="p-4 bg-cyber-dark/20 rounded border border-cyber-cyan/20">
                          <h4 className="text-sm font-medium text-white mb-2">Monitoring Status</h4>
                          <div className="grid grid-cols-3 gap-4 text-xs">
                            <div>
                              <span className="text-gray-400">Total Monitored:</span>
                              <span className="text-cyber-cyan ml-2">{monitoringStatus.totalMonitored || 0}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Active Alerts:</span>
                              <span className="text-amber-400 ml-2">{monitoringStatus.activeAlerts || 0}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Last Update:</span>
                              <span className="text-gray-300 ml-2">
                                {monitoringStatus.lastUpdate ? new Date(monitoringStatus.lastUpdate).toLocaleTimeString() : 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Success/Error Messages */}
                      {(error || success) && (
                        <div className="space-y-2">
                          {error && (
                            <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-500/30 rounded text-red-400">
                              <AlertCircle className="w-4 h-4" />
                              <span className="text-sm">{error}</span>
                              <button onClick={clearMessages} className="ml-auto text-red-300 hover:text-red-200">
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                          
                          {success && (
                            <div className="flex items-center gap-2 p-3 bg-green-900/20 border border-green-500/30 rounded text-green-400">
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-sm">{success}</span>
                              <button onClick={clearMessages} className="ml-auto text-green-300 hover:text-green-200">
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Save Settings Button */}
                      <div className="flex justify-end pt-4 border-t border-cyber-cyan/20">
                        <Button 
                          className="bg-cyber-cyan/20 border border-cyber-cyan/30 text-cyber-cyan hover:bg-cyber-cyan/30"
                          onClick={() => {
                            setSuccess('Settings saved successfully')
                            setTimeout(() => setSuccess(''), 3000)
                          }}
                        >
                          Save Settings
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
      {/* Bottom Navigation - Mobile Only */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-cyber-dark/95 backdrop-blur-sm border-t border-cyber-cyan/30 z-50 shadow-lg shadow-cyber-cyan/10">
        <div className="grid grid-cols-5 gap-1 px-2 sm:px-4 py-2 sm:py-3">
          {bottomNavItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.action) {
                    item.action()
                  } else {
                    setActiveSection(item.id)
                  }
                }}
                className={`flex flex-col items-center justify-center py-2 sm:py-3 px-1 sm:px-2 rounded-lg transition-all duration-200 relative ${
                  activeSection === item.id || (item.id === "chat" && isChatboxOpen)
                    ? "bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/30"
                    : "text-gray-400 hover:text-cyber-cyan hover:bg-cyber-cyan/10 border border-transparent"
                }`}
              >
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 mb-0.5 sm:mb-1" />
                <span className="text-xs font-medium leading-tight">{item.label}</span>
                {item.id === "chat" && isChatboxOpen && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-cyber-green rounded-full animate-pulse" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div
        className={`fixed bottom-20 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-cyber-dark/95 backdrop-blur-sm border border-cyber-cyan/30 rounded-lg shadow-xl transition-all duration-300 z-40 ${
          isChatboxOpen ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        {/* Chatbox Header */}
        <div className="flex items-center justify-between p-4 border-b border-cyber-cyan/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-cyber-cyan/20 rounded-full flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-cyber-cyan" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-white">AI Assistant</h3>
              <p className="text-xs text-gray-400">Online</p>
            </div>
          </div>
          <button onClick={() => setIsChatboxOpen(false)} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="h-64 overflow-y-auto p-4 space-y-3">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] p-3 rounded-lg text-sm ${
                  message.sender === "user"
                    ? "bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/30"
                    : "bg-gray-800/50 text-gray-300 border border-gray-700/50"
                }`}
              >
                <p>{message.text}</p>
                <p className="text-xs opacity-60 mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-cyber-cyan/20">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Ask about blockchain monitoring..."
              className="flex-1 bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-cyber-cyan/50"
            />
            <button
              onClick={handleSendMessage}
              className="bg-cyber-cyan/20 border border-cyber-cyan/30 text-cyber-cyan hover:bg-cyber-cyan/30 rounded-lg px-3 py-2 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
