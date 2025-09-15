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
  ArrowUpRight,
  ArrowDownLeft,
  Coins,
  FileImage,
  GitBranch,
  Hash,
  ExternalLink,
} from "lucide-react"
import { WatchlistManagement } from "@/components/watchlist-management"
import Link from "next/link"
import { useState, useEffect } from "react"
import { apiService } from "@/lib/api"
import { wsService } from "@/lib/websocket"
import { cn } from "@/lib/utils"

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
  const [watchlists, setWatchlists] = useState<{
    tokens: Array<{ id: string | number; value: string; [key: string]: any }>;
    wallets: Array<{ id: string | number; value: string; [key: string]: any }>;
    nfts: Array<{ id: string | number; value: string; [key: string]: any }>;
    [key: string]: Array<{ id: string | number; value: string; [key: string]: any }>;
  }>({
    tokens: [],
    wallets: [],
    nfts: []
  })
  const [thresholds, setThresholds] = useState({
    priceChange: 10,
    volumeChange: 50,
    transactionAmount: 1000,
    tokenAmount: 1000
  })
  const [notifications, setNotifications] = useState({
    email: true,
    telegram: false,
    discord: true,
    largeTransaction: true,
    unusualActivity: true,
    highFrequency: false,
    tokenTransfer: true,
    newContract: false,
    failedTx: true,
    riskLevels: {
      low: false,
      medium: true,
      high: true,
      critical: true
    }
  })
  const [newWatchlistItem, setNewWatchlistItem] = useState({
    type: 'tokens',
    value: '',
    label: ''
  })
  
  // Modal and API state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [monitoringStatus, setMonitoringStatus] = useState<{
    totalMonitored?: number;
    activeAlerts?: number;
    lastUpdate?: number;
    [key: string]: any;
  } | null>(null)
  const [activityFeed, setActivityFeed] = useState<any[]>([])
  const [isLoadingActivity, setIsLoadingActivity] = useState(false)
  
  // Activity feed filters
  const [activityFilters, setActivityFilters] = useState({
    type: 'all', // all, blockchain_activity, wallet_event, alert
    activityType: 'all', // all, transaction, token_transfer, nft_transfer, internal_transaction
    severity: 'all', // all, info, warning, error, critical
    riskLevel: 'all', // all, low, medium, high, critical
    timeRange: 'all', // all, 1h, 6h, 24h, 7d
    searchTerm: ''
  })
  
  // Load monitoring status on component mount and set up WebSocket
  useEffect(() => {
    loadMonitoringStatus()
    loadActivityFeed()
    
    // Connect to WebSocket for real-time updates
    wsService.connect()
    
    // Subscribe to wallet monitoring events
    const unsubscribeActivity = wsService.subscribe('unusual_activity_detected', (message) => {
      console.log('Unusual activity detected:', message)
      // Refresh monitoring status when unusual activity is detected
      loadMonitoringStatus()
      setSuccess(`⚠️ Unusual activity detected on wallet ${message.walletAddress}`)
      setTimeout(() => setSuccess(''), 5000)
    })
    
    const unsubscribeWalletEvents = wsService.subscribe('wallet_monitoring_update', (message) => {
      console.log('Wallet monitoring update:', message)
      // Refresh data when wallets are added/removed
      loadMonitoringStatus()
      loadActivityFeed()
    })
    
    // Cleanup on unmount
    return () => {
      unsubscribeActivity()
      unsubscribeWalletEvents()
    }
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
            addedAt: wallet.addedAt,
            riskScore: wallet.riskScore || 25 // Default to low risk if not analyzed
          }))
        }))
      }
    } catch (err) {
      console.error('Failed to load monitoring data:', err)
    }
  }
  
  const loadActivityFeed = async () => {
    try {
      setIsLoadingActivity(true)
      
      // Load real blockchain activities for all monitored wallets
      const [activityResponse, walletEventsResponse, alertsResponse] = await Promise.all([
        apiService.getActivityFeed(30), // Get last 30 blockchain activities
        apiService.getWalletEvents(10), // Get last 10 wallet events
        apiService.getAlerts(10) // Get last 10 alerts
      ])
      
      const activityItems = []
      
      // Add real blockchain activities
      if (activityResponse.data && activityResponse.data.activities) {
        activityResponse.data.activities.forEach(activity => {
          let title, description, icon
          
          switch (activity.type) {
            case 'transaction':
              title = 'ETH Transaction'
              description = `${activity.valueEth} ETH sent from ${formatAddress(activity.from)} to ${formatAddress(activity.to)}`
              icon = 'transaction'
              break
            case 'token_transfer':
              title = `${activity.tokenSymbol || 'Token'} Transfer`
              description = `${activity.formattedValue || activity.value} ${activity.tokenSymbol || ''} transferred`
              icon = 'token'
              break
            case 'nft_transfer':
              title = `${activity.tokenSymbol || 'NFT'} Transfer`
              description = `NFT #${activity.tokenID} (${activity.tokenName || 'Unknown'}) transferred`
              icon = 'nft'
              break
            case 'internal_transaction':
              title = 'Internal Transaction'
              description = `${activity.valueEth} ETH internal transfer`
              icon = 'internal'
              break
            default:
              title = 'Blockchain Activity'
              description = 'Unknown activity type'
              icon = 'unknown'
          }

          activityItems.push({
            id: `activity-${activity.hash}-${activity.timestamp}`,
            type: 'blockchain_activity',
            activityType: activity.type,
            title,
            description,
            timestamp: activity.timestamp,
            severity: 'info',
            hash: activity.hash,
            from: activity.from,
            to: activity.to,
            value: activity.value,
            valueEth: activity.valueEth,
            blockNumber: activity.blockNumber,
            isError: activity.isError,
            tokenSymbol: activity.tokenSymbol,
            tokenName: activity.tokenName,
            contractAddress: activity.contractAddress,
            monitoredItem: activity.monitoredItem,
            monitoredType: activity.monitoredType,
            itemRiskLevel: activity.itemRiskLevel,
            icon
          })
        })
      }
      
      // Add wallet management events
      if (walletEventsResponse.data && walletEventsResponse.data.events) {
        walletEventsResponse.data.events.forEach(event => {
          activityItems.push({
            id: `event-${event.id || Date.now()}`,
            type: 'wallet_event',
            title: `Wallet ${event.data?.payload?.eventType === 'added' ? 'Added' : 'Removed'}`,
            description: `${formatAddress(event.data?.payload?.walletAddress) || 'Unknown'} ${event.data?.payload?.eventType === 'added' ? 'added to' : 'removed from'} monitoring`,
            timestamp: event.timestamp || Date.now(),
            severity: event.data?.payload?.eventType === 'added' ? 'info' : 'warning',
            walletAddress: event.data?.payload?.walletAddress,
            metadata: event.data?.payload?.metadata,
            icon: 'wallet'
          })
        })
      }
      
      // Add alerts
      if (alertsResponse.data && alertsResponse.data.alerts) {
        alertsResponse.data.alerts.forEach(alert => {
          activityItems.push({
            id: `alert-${alert.transactionHash || Date.now()}`,
            type: 'alert',
            title: 'Unusual Activity Detected',
            description: `${alert.classification?.riskLevel || 'Unknown'} risk activity on ${formatAddress(alert.originalTransaction?.from) || 'wallet'}`,
            timestamp: alert.timestamp || Date.now(),
            severity: getSeverityFromRisk(alert.classification?.riskLevel),
            transactionHash: alert.transactionHash,
            riskLevel: alert.classification?.riskLevel,
            anomalies: alert.classification?.anomalies,
            icon: 'alert'
          })
        })
      }
      
      // Sort by timestamp (most recent first)
      activityItems.sort((a, b) => b.timestamp - a.timestamp)
      
      setActivityFeed(activityItems)
    } catch (err) {
      console.error('Failed to load activity feed:', err)
    } finally {
      setIsLoadingActivity(false)
    }
  }
  
  const getSeverityFromRisk = (riskLevel) => {
    switch (riskLevel) {
      case 'critical': return 'critical'
      case 'high': return 'error'
      case 'medium': return 'warning'
      case 'low': return 'info'
      default: return 'info'
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
          thresholds.transactionAmount,
          'wallet',
          '1',
          newWatchlistItem.label.trim() || `Wallet ${newWatchlistItem.value.slice(0, 8)}...`
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
      
      setNewWatchlistItem(prev => ({ ...prev, value: '', label: '' }))
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
  
  const formatTimeAgo = (timestamp) => {
    const diff = Date.now() - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return "just now"
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`
  }

  const getBlockchainActivityIconColor = (activityType: string) => {
    switch (activityType) {
      case 'transaction':
        return "bg-blue-500/20 text-blue-400"
      case 'token_transfer':
        return "bg-green-500/20 text-green-400"
      case 'nft_transfer':
        return "bg-purple-500/20 text-purple-400"
      case 'internal_transaction':
        return "bg-orange-500/20 text-orange-400"
      default:
        return "bg-cyber-cyan/20 text-cyber-cyan"
    }
  }

  const getActivityIcon = (item: any) => {
    if (item.type === 'blockchain_activity') {
      switch (item.activityType) {
        case 'transaction':
          return <ArrowUpRight className="w-5 h-5" />
        case 'token_transfer':
          return <Coins className="w-5 h-5" />
        case 'nft_transfer':
          return <FileImage className="w-5 h-5" />
        case 'internal_transaction':
          return <GitBranch className="w-5 h-5" />
        default:
          return <Hash className="w-5 h-5" />
      }
    } else if (item.type === 'wallet_event') {
      return <Wallet className="w-5 h-5" />
    } else if (item.type === 'alert') {
      return <AlertTriangle className="w-5 h-5" />
    } else {
      return <Activity className="w-5 h-5" />
    }
  }

  // Filter activity feed based on current filters
  const getFilteredActivityFeed = () => {
    let filtered = [...activityFeed]

    // Filter by type
    if (activityFilters.type !== 'all') {
      filtered = filtered.filter(item => item.type === activityFilters.type)
    }

    // Filter by activity type (for blockchain activities)
    if (activityFilters.activityType !== 'all') {
      filtered = filtered.filter(item => 
        item.type !== 'blockchain_activity' || item.activityType === activityFilters.activityType
      )
    }

    // Filter by severity
    if (activityFilters.severity !== 'all') {
      filtered = filtered.filter(item => item.severity === activityFilters.severity)
    }

    // Filter by risk level
    if (activityFilters.riskLevel !== 'all') {
      filtered = filtered.filter(item => 
        item.riskLevel === activityFilters.riskLevel || 
        item.itemRiskLevel === activityFilters.riskLevel
      )
    }

    // Filter by time range
    if (activityFilters.timeRange !== 'all') {
      const now = Date.now()
      let timeThreshold = 0
      
      switch (activityFilters.timeRange) {
        case '1h':
          timeThreshold = now - (60 * 60 * 1000)
          break
        case '6h':
          timeThreshold = now - (6 * 60 * 60 * 1000)
          break
        case '24h':
          timeThreshold = now - (24 * 60 * 60 * 1000)
          break
        case '7d':
          timeThreshold = now - (7 * 24 * 60 * 60 * 1000)
          break
      }
      
      filtered = filtered.filter(item => item.timestamp >= timeThreshold)
    }

    // Filter by search term
    if (activityFilters.searchTerm.trim()) {
      const searchLower = activityFilters.searchTerm.toLowerCase()
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower) ||
        (item.hash && item.hash.toLowerCase().includes(searchLower)) ||
        (item.from && item.from.toLowerCase().includes(searchLower)) ||
        (item.to && item.to.toLowerCase().includes(searchLower)) ||
        (item.walletAddress && item.walletAddress.toLowerCase().includes(searchLower)) ||
        (item.tokenSymbol && item.tokenSymbol.toLowerCase().includes(searchLower))
      )
    }

    return filtered
  }

  // Clear all filters
  const clearAllFilters = () => {
    setActivityFilters({
      type: 'all',
      activityType: 'all', 
      severity: 'all',
      riskLevel: 'all',
      timeRange: 'all',
      searchTerm: ''
    })
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
                <div className="space-y-6">
                  <Card className="bg-cyber-dark/50 border-cyber-cyan/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Activity className="w-5 h-5 text-cyber-cyan" />
                        Activity Feed
                      </CardTitle>
                      <CardDescription>Real-time monitoring events and alerts from 0G Storage</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* Activity Feed Filters */}
                      <div className="mb-6 space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                          {/* Search Input */}
                          <div className="flex-1">
                            <Input
                              placeholder="Search activities, addresses, hashes..."
                              value={activityFilters.searchTerm}
                              onChange={(e) => setActivityFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                              className="bg-cyber-dark/30 border-cyber-cyan/30 text-white placeholder-gray-400"
                            />
                          </div>
                          
                          {/* Clear Filters Button */}
                          <Button
                            onClick={clearAllFilters}
                            variant="outline"
                            className="border-gray-600 text-gray-300 hover:bg-gray-800"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Clear Filters
                          </Button>
                        </div>
                        
                        {/* Filter Controls Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                          {/* Activity Type Filter */}
                          <div className="space-y-1">
                            <Label className="text-xs text-gray-400">Type</Label>
                            <Select value={activityFilters.type} onValueChange={(value) => setActivityFilters(prev => ({ ...prev, type: value }))}>
                              <SelectTrigger className="bg-cyber-dark/30 border-cyber-cyan/30 text-white text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-cyber-dark border-cyber-cyan/30">
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="blockchain_activity">Blockchain</SelectItem>
                                <SelectItem value="wallet_event">Wallet Events</SelectItem>
                                <SelectItem value="alert">Alerts</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {/* Blockchain Activity Type Filter */}
                          <div className="space-y-1">
                            <Label className="text-xs text-gray-400">Activity</Label>
                            <Select 
                              value={activityFilters.activityType} 
                              onValueChange={(value) => setActivityFilters(prev => ({ ...prev, activityType: value }))}
                              disabled={activityFilters.type !== 'all' && activityFilters.type !== 'blockchain_activity'}
                            >
                              <SelectTrigger className="bg-cyber-dark/30 border-cyber-cyan/30 text-white text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-cyber-dark border-cyber-cyan/30">
                                <SelectItem value="all">All Activities</SelectItem>
                                <SelectItem value="transaction">Transactions</SelectItem>
                                <SelectItem value="token_transfer">Token Transfers</SelectItem>
                                <SelectItem value="nft_transfer">NFT Transfers</SelectItem>
                                <SelectItem value="internal_transaction">Internal Txs</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {/* Severity Filter */}
                          <div className="space-y-1">
                            <Label className="text-xs text-gray-400">Severity</Label>
                            <Select value={activityFilters.severity} onValueChange={(value) => setActivityFilters(prev => ({ ...prev, severity: value }))}>
                              <SelectTrigger className="bg-cyber-dark/30 border-cyber-cyan/30 text-white text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-cyber-dark border-cyber-cyan/30">
                                <SelectItem value="all">All Severities</SelectItem>
                                <SelectItem value="info">Info</SelectItem>
                                <SelectItem value="warning">Warning</SelectItem>
                                <SelectItem value="error">Error</SelectItem>
                                <SelectItem value="critical">Critical</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {/* Risk Level Filter */}
                          <div className="space-y-1">
                            <Label className="text-xs text-gray-400">Risk Level</Label>
                            <Select value={activityFilters.riskLevel} onValueChange={(value) => setActivityFilters(prev => ({ ...prev, riskLevel: value }))}>
                              <SelectTrigger className="bg-cyber-dark/30 border-cyber-cyan/30 text-white text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-cyber-dark border-cyber-cyan/30">
                                <SelectItem value="all">All Risk Levels</SelectItem>
                                <SelectItem value="low">Low Risk</SelectItem>
                                <SelectItem value="medium">Medium Risk</SelectItem>
                                <SelectItem value="high">High Risk</SelectItem>
                                <SelectItem value="critical">Critical Risk</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {/* Time Range Filter */}
                          <div className="space-y-1">
                            <Label className="text-xs text-gray-400">Time Range</Label>
                            <Select value={activityFilters.timeRange} onValueChange={(value) => setActivityFilters(prev => ({ ...prev, timeRange: value }))}>
                              <SelectTrigger className="bg-cyber-dark/30 border-cyber-cyan/30 text-white text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-cyber-dark border-cyber-cyan/30">
                                <SelectItem value="all">All Time</SelectItem>
                                <SelectItem value="1h">Last Hour</SelectItem>
                                <SelectItem value="6h">Last 6 Hours</SelectItem>
                                <SelectItem value="24h">Last 24 Hours</SelectItem>
                                <SelectItem value="7d">Last 7 Days</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        {/* Active Filter Count */}
                        {(() => {
                          const activeFilterCount = Object.values(activityFilters).filter(
                            (value, index) => index < 5 && value !== 'all'
                          ).length + (activityFilters.searchTerm.trim() ? 1 : 0)
                          
                          return activeFilterCount > 0 ? (
                            <div className="flex items-center gap-2 text-sm">
                              <Badge variant="outline" className="border-cyber-cyan/30 text-cyber-cyan">
                                {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
                              </Badge>
                              <span className="text-gray-400">
                                Showing {getFilteredActivityFeed().length} of {activityFeed.length} activities
                              </span>
                            </div>
                          ) : null
                        })()}
                      </div>
                      {isLoadingActivity ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin h-8 w-8 border-4 border-cyber-cyan/20 border-t-cyber-cyan rounded-full"></div>
                          <span className="ml-3 text-gray-400">Loading activity feed...</span>
                        </div>
                      ) : (() => {
                        const filteredActivities = getFilteredActivityFeed()
                        
                        if (activityFeed.length === 0) {
                          return (
                            <div className="text-center py-8">
                              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                              <h3 className="text-lg font-medium text-white mb-2">No Recent Activity</h3>
                              <p className="text-gray-400">Add wallets to monitoring to see activity events</p>
                            </div>
                          )
                        }
                        
                        if (filteredActivities.length === 0) {
                          return (
                            <div className="text-center py-8">
                              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                              <h3 className="text-lg font-medium text-white mb-2">No Activities Match Filters</h3>
                              <p className="text-gray-400">Try adjusting your filters to see more results</p>
                              <Button 
                                onClick={clearAllFilters}
                                className="mt-4 bg-cyber-cyan/20 border border-cyber-cyan/30 text-cyber-cyan hover:bg-cyber-cyan/30"
                              >
                                Clear All Filters
                              </Button>
                            </div>
                          )
                        }
                        
                        return (
                          <div className="space-y-4 max-h-96 overflow-y-auto">
                            {filteredActivities.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-start gap-4 p-4 rounded-lg border border-cyber-cyan/10 bg-cyber-dark/30 hover:bg-cyber-dark/50 transition-colors"
                            >
                              {/* Activity Icon */}
                              <div className={cn(
                                "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                                item.severity === 'critical' && "bg-red-500/20 text-red-400",
                                item.severity === 'error' && "bg-red-500/20 text-red-400",
                                item.severity === 'warning' && "bg-amber-500/20 text-amber-400",
                                item.severity === 'info' && "bg-cyber-cyan/20 text-cyber-cyan",
                                item.type === 'blockchain_activity' && getBlockchainActivityIconColor(item.activityType),
                                !item.severity && "bg-gray-500/20 text-gray-400"
                              )}>
                                {getActivityIcon(item)}
                              </div>
                              
                              {/* Activity Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className="text-sm font-medium text-white">{item.title}</h4>
                                    <p className="text-sm text-gray-400 mt-1">{item.description}</p>
                                    
                                    {/* Additional Details */}
                                    {item.type === 'blockchain_activity' && (
                                      <div className="mt-2 space-y-2">
                                        {/* Transaction Hash */}
                                        {item.hash && (
                                          <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="text-xs border-gray-500/30 text-gray-300 font-mono">
                                              {formatAddress(item.hash)}
                                            </Badge>
                                            <ExternalLink className="w-3 h-3 text-gray-400 hover:text-cyber-cyan cursor-pointer" 
                                              onClick={() => window.open(`https://etherscan.io/tx/${item.hash}`, '_blank')} />
                                          </div>
                                        )}
                                        
                                        {/* From/To addresses for transactions */}
                                        {(item.from || item.to) && (
                                          <div className="flex items-center gap-2 text-xs">
                                            {item.from && (
                                              <>
                                                <span className="text-gray-500">From:</span>
                                                <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-400">
                                                  {formatAddress(item.from)}
                                                </Badge>
                                              </>
                                            )}
                                            {item.from && item.to && <ArrowUpRight className="w-3 h-3 text-gray-500" />}
                                            {item.to && (
                                              <>
                                                <span className="text-gray-500">To:</span>
                                                <Badge variant="outline" className="text-xs border-green-500/30 text-green-400">
                                                  {formatAddress(item.to)}
                                                </Badge>
                                              </>
                                            )}
                                          </div>
                                        )}
                                        
                                        {/* Token/Contract Info */}
                                        {item.contractAddress && (
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-500">Contract:</span>
                                            <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-400">
                                              {formatAddress(item.contractAddress)}
                                            </Badge>
                                          </div>
                                        )}
                                        
                                        {/* Monitored Item */}
                                        {item.monitoredItem && (
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-500">
                                              Monitored {item.monitoredType || 'Item'}:
                                            </span>
                                            <Badge variant="outline" className="text-xs border-cyber-cyan/30 text-cyber-cyan">
                                              {formatAddress(item.monitoredItem)}
                                            </Badge>
                                            {item.monitoredType && (
                                              <Badge className={cn(
                                                "text-xs capitalize",
                                                item.monitoredType === 'token' && "bg-green-500/20 text-green-400 border-green-500/30",
                                                item.monitoredType === 'wallet' && "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
                                                item.monitoredType === 'contract' && "bg-purple-500/20 text-purple-400 border-purple-500/30",
                                                item.monitoredType === 'project' && "bg-orange-500/20 text-orange-400 border-orange-500/30"
                                              )}>
                                                {item.monitoredType === 'token' ? 'ERC-20' : item.monitoredType}
                                              </Badge>
                                            )}
                                            {item.itemRiskLevel && (
                                              <Badge className={cn(
                                                "text-xs",
                                                item.itemRiskLevel === 'critical' && "bg-red-500/20 text-red-400 border-red-500/30",
                                                item.itemRiskLevel === 'high' && "bg-orange-500/20 text-orange-400 border-orange-500/30",
                                                item.itemRiskLevel === 'medium' && "bg-amber-500/20 text-amber-400 border-amber-500/30",
                                                item.itemRiskLevel === 'low' && "bg-green-500/20 text-green-400 border-green-500/30"
                                              )}>
                                                {item.itemRiskLevel.toUpperCase()}
                                              </Badge>
                                            )}
                                          </div>
                                        )}
                                        
                                        {/* Block Number */}
                                        {item.blockNumber && (
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-500">Block:</span>
                                            <Badge variant="outline" className="text-xs border-gray-500/30 text-gray-400">
                                              #{item.blockNumber.toLocaleString()}
                                            </Badge>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                    
                                    {/* Wallet Event Details */}
                                    {item.type === 'wallet_event' && item.walletAddress && (
                                      <div className="mt-2 flex items-center gap-2">
                                        <Badge variant="outline" className="text-xs border-cyber-cyan/30 text-cyber-cyan">
                                          {formatAddress(item.walletAddress)}
                                        </Badge>
                                      </div>
                                    )}
                                    
                                    {/* Alert Anomalies */}
                                    {item.anomalies && item.anomalies.length > 0 && (
                                      <div className="mt-2 flex flex-wrap gap-1">
                                        {item.anomalies.map((anomaly, index) => (
                                          <Badge key={index} variant="outline" className="text-xs border-amber-400/30 text-amber-400">
                                            {anomaly}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="flex flex-col items-end text-right">
                                    <span className="text-xs text-gray-500">
                                      {formatTimeAgo(item.timestamp)}
                                    </span>
                                    {item.riskLevel && (
                                      <Badge className={cn(
                                        "text-xs mt-1",
                                        item.riskLevel === 'critical' && "bg-red-500/20 text-red-400 border-red-500/30",
                                        item.riskLevel === 'high' && "bg-orange-500/20 text-orange-400 border-orange-500/30",
                                        item.riskLevel === 'medium' && "bg-amber-500/20 text-amber-400 border-amber-500/30",
                                        item.riskLevel === 'low' && "bg-green-500/20 text-green-400 border-green-500/30"
                                      )}>
                                        {item.riskLevel.toUpperCase()}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            ))}
                          </div>
                        )
                      })()}
                      
                      {/* Action Buttons */}
                      <div className="flex justify-center gap-4 pt-4 border-t border-cyber-cyan/20 mt-6">
                        <Button
                          onClick={loadActivityFeed}
                          disabled={isLoadingActivity}
                          className="bg-cyber-cyan/20 border border-cyber-cyan/30 text-cyber-cyan hover:bg-cyber-cyan/30"
                        >
                          {isLoadingActivity ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Refreshing...
                            </>
                          ) : (
                            'Refresh Activity'
                          )}
                        </Button>
                        
                        {process.env.NODE_ENV !== 'production' && (
                          <Button
                            onClick={async () => {
                              try {
                                setIsLoadingActivity(true)
                                const response = await apiService.generateTestActivity()
                                if (response.data) {
                                  setSuccess(`✅ Generated ${response.data.eventsCreated} test activity events`)
                                  setTimeout(() => setSuccess(''), 3000)
                                  // Reload activity feed to show new data
                                  await loadActivityFeed()
                                }
                              } catch (err) {
                                setError('Failed to generate test activity data')
                                setTimeout(() => setError(''), 3000)
                              } finally {
                                setIsLoadingActivity(false)
                              }
                            }}
                            disabled={isLoadingActivity}
                            className="bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:bg-amber-500/30"
                          >
                            {isLoadingActivity ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              'Generate Test Data'
                            )}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Alerts Section */}
              {activeSection === "alerts" && (
                <div className="space-y-6">
                  {/* Alert Rules Configuration */}
                  <Card className="bg-cyber-dark/50 border-cyber-cyan/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <AlertTriangle className="w-5 h-5 text-amber-400" />
                        Alert Rules Configuration
                      </CardTitle>
                      <CardDescription>Configure automated alert triggers for blockchain activities</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Alert Rule Categories */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Transaction Alerts */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium text-white border-b border-cyber-cyan/20 pb-2">
                            Transaction Alerts
                          </h3>
                          
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-cyber-dark/30 rounded border border-cyber-cyan/10">
                              <div>
                                <Label className="text-white">Large Transaction Alert</Label>
                                <p className="text-xs text-gray-400">Alert when transaction exceeds threshold</p>
                              </div>
                              <Switch
                                checked={notifications.largeTransaction}
                                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, largeTransaction: checked }))}
                              />
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Label className="text-white text-sm">Threshold ($):</Label>
                              <Input
                                type="number"
                                value={thresholds.transactionAmount}
                                onChange={(e) => setThresholds(prev => ({ ...prev, transactionAmount: Number(e.target.value) }))}
                                className="w-32 bg-cyber-dark/30 border-cyber-cyan/30 text-white"
                                placeholder="10000"
                              />
                            </div>
                            
                            <div className="flex items-center justify-between p-3 bg-cyber-dark/30 rounded border border-cyber-cyan/10">
                              <div>
                                <Label className="text-white">Unusual Activity Pattern</Label>
                                <p className="text-xs text-gray-400">AI-detected anomalous behavior</p>
                              </div>
                              <Switch
                                checked={notifications.unusualActivity}
                                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, unusualActivity: checked }))}
                              />
                            </div>
                            
                            <div className="flex items-center justify-between p-3 bg-cyber-dark/30 rounded border border-cyber-cyan/10">
                              <div>
                                <Label className="text-white">High Frequency Trading</Label>
                                <p className="text-xs text-gray-400">Multiple transactions in short time</p>
                              </div>
                              <Switch
                                checked={notifications.highFrequency}
                                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, highFrequency: checked }))}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Token & Contract Alerts */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium text-white border-b border-cyber-cyan/20 pb-2">
                            Token & Contract Alerts
                          </h3>
                          
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-cyber-dark/30 rounded border border-cyber-cyan/10">
                              <div>
                                <Label className="text-white">Token Transfer Alert</Label>
                                <p className="text-xs text-gray-400">Alert on monitored token movements</p>
                              </div>
                              <Switch
                                checked={notifications.tokenTransfer}
                                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, tokenTransfer: checked }))}
                              />
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Label className="text-white text-sm">Min Amount:</Label>
                              <Input
                                type="number"
                                value={thresholds.tokenAmount}
                                onChange={(e) => setThresholds(prev => ({ ...prev, tokenAmount: Number(e.target.value) }))}
                                className="w-32 bg-cyber-dark/30 border-cyber-cyan/30 text-white"
                                placeholder="1000"
                              />
                            </div>
                            
                            <div className="flex items-center justify-between p-3 bg-cyber-dark/30 rounded border border-cyber-cyan/10">
                              <div>
                                <Label className="text-white">New Contract Interaction</Label>
                                <p className="text-xs text-gray-400">First-time contract interactions</p>
                              </div>
                              <Switch
                                checked={notifications.newContract}
                                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, newContract: checked }))}
                              />
                            </div>
                            
                            <div className="flex items-center justify-between p-3 bg-cyber-dark/30 rounded border border-cyber-cyan/10">
                              <div>
                                <Label className="text-white">Failed Transactions</Label>
                                <p className="text-xs text-gray-400">Alert on transaction failures</p>
                              </div>
                              <Switch
                                checked={notifications.failedTx}
                                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, failedTx: checked }))}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Risk Level Filters */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-white border-b border-cyber-cyan/20 pb-2">
                          Risk Level Filtering
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {['low', 'medium', 'high', 'critical'].map((risk) => (
                            <div key={risk} className="flex items-center justify-between p-3 bg-cyber-dark/30 rounded border border-cyber-cyan/10">
                              <Label className={cn(
                                "capitalize font-medium",
                                risk === 'low' && "text-green-400",
                                risk === 'medium' && "text-amber-400", 
                                risk === 'high' && "text-orange-400",
                                risk === 'critical' && "text-red-400"
                              )}>{risk} Risk</Label>
                              <Switch
                                checked={notifications.riskLevels?.[risk] || false}
                                onCheckedChange={(checked) => setNotifications(prev => ({
                                  ...prev,
                                  riskLevels: { ...prev.riskLevels, [risk]: checked }
                                }))}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Active Alerts Management */}
                  <Card className="bg-cyber-dark/50 border-cyber-cyan/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Bell className="w-5 h-5 text-cyber-green" />
                        Active Alerts
                      </CardTitle>
                      <CardDescription>View and manage currently active alerts</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoadingActivity ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin h-8 w-8 border-4 border-cyber-cyan/20 border-t-cyber-cyan rounded-full"></div>
                          <span className="ml-3 text-gray-400">Loading active alerts...</span>
                        </div>
                      ) : (
                        <div className="space-y-4 max-h-64 overflow-y-auto">
                          {getFilteredActivityFeed().filter(item => item.type === 'alert').slice(0, 5).map((alert) => (
                            <div
                              key={alert.id}
                              className="flex items-center justify-between p-4 rounded-lg border border-red-500/20 bg-red-500/5"
                            >
                              <div className="flex items-center gap-3">
                                <AlertTriangle className="w-5 h-5 text-red-400" />
                                <div>
                                  <h4 className="text-sm font-medium text-white">{alert.title}</h4>
                                  <p className="text-xs text-gray-400">{alert.description}</p>
                                  <span className="text-xs text-gray-500">{formatTimeAgo(alert.timestamp)}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {alert.riskLevel && (
                                  <Badge className={cn(
                                    "text-xs",
                                    alert.riskLevel === 'critical' && "bg-red-500/20 text-red-400 border-red-500/30",
                                    alert.riskLevel === 'high' && "bg-orange-500/20 text-orange-400 border-orange-500/30",
                                    alert.riskLevel === 'medium' && "bg-amber-500/20 text-amber-400 border-amber-500/30",
                                    alert.riskLevel === 'low' && "bg-green-500/20 text-green-400 border-green-500/30"
                                  )}>
                                    {alert.riskLevel.toUpperCase()}
                                  </Badge>
                                )}
                                <Button variant="outline" size="sm" className="text-xs border-gray-600 text-gray-300 hover:bg-gray-800">
                                  Dismiss
                                </Button>
                              </div>
                            </div>
                          ))}
                          
                          {getFilteredActivityFeed().filter(item => item.type === 'alert').length === 0 && (
                            <div className="text-center py-8">
                              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                              <h3 className="text-lg font-medium text-white mb-2">No Active Alerts</h3>
                              <p className="text-gray-400">All systems running normally</p>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Alert History */}
                  <Card className="bg-cyber-dark/50 border-cyber-cyan/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <BarChart3 className="w-5 h-5 text-purple-400" />
                        Alert Statistics
                      </CardTitle>
                      <CardDescription>Alert frequency and patterns over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-cyber-dark/30 rounded border border-cyber-cyan/10 text-center">
                          <div className="text-2xl font-bold text-cyber-cyan">
                            {getFilteredActivityFeed().filter(item => item.type === 'alert').length}
                          </div>
                          <div className="text-sm text-gray-400">Total Alerts</div>
                        </div>
                        
                        <div className="p-4 bg-cyber-dark/30 rounded border border-cyber-cyan/10 text-center">
                          <div className="text-2xl font-bold text-red-400">
                            {getFilteredActivityFeed().filter(item => item.type === 'alert' && item.riskLevel === 'critical').length}
                          </div>
                          <div className="text-sm text-gray-400">Critical Alerts</div>
                        </div>
                        
                        <div className="p-4 bg-cyber-dark/30 rounded border border-cyber-cyan/10 text-center">
                          <div className="text-2xl font-bold text-green-400">
                            {monitoringStatus?.totalMonitored || 0}
                          </div>
                          <div className="text-sm text-gray-400">Monitored Items</div>
                        </div>
                        
                        <div className="p-4 bg-cyber-dark/30 rounded border border-cyber-cyan/10 text-center">
                          <div className="text-2xl font-bold text-amber-400">
                            {getFilteredActivityFeed().filter(item => 
                              item.type === 'alert' && 
                              item.timestamp > Date.now() - 24 * 60 * 60 * 1000
                            ).length}
                          </div>
                          <div className="text-sm text-gray-400">Last 24h</div>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex justify-center gap-4 pt-6 border-t border-cyber-cyan/20 mt-6">
                        <Button
                          onClick={() => {
                            setSuccess('✅ Alert settings saved successfully')
                            setTimeout(() => setSuccess(''), 3000)
                          }}
                          className="bg-cyber-green/20 border border-cyber-green/30 text-cyber-green hover:bg-cyber-green/30"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Save Alert Settings
                        </Button>
                        
                        <Button
                          onClick={loadActivityFeed}
                          disabled={isLoadingActivity}
                          variant="outline"
                          className="border-cyber-cyan/30 text-cyber-cyan hover:bg-cyber-cyan/10"
                        >
                          {isLoadingActivity ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Refreshing...
                            </>
                          ) : (
                            <>
                              <Activity className="w-4 h-4 mr-2" />
                              Refresh Alerts
                            </>
                          )}
                        </Button>
                        
                        <Button
                          onClick={() => {
                            setNotifications({
                              email: false,
                              telegram: false,
                              discord: false,
                              largeTransaction: false,
                              unusualActivity: false,
                              highFrequency: false,
                              tokenTransfer: false,
                              newContract: false,
                              failedTx: false,
                              riskLevels: { low: false, medium: false, high: false, critical: false }
                            })
                            setSuccess('🔕 All alerts disabled')
                            setTimeout(() => setSuccess(''), 3000)
                          }}
                          variant="outline"
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Disable All
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
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
                              
                              {/* Label Input */}
                              <div className="space-y-2">
                                <Label className="text-white">Label</Label>
                                <Input
                                  value={newWatchlistItem.label}
                                  onChange={(e) => setNewWatchlistItem(prev => ({ ...prev, label: e.target.value }))}
                                  placeholder={`Enter a descriptive label (e.g., "Exchange Wallet", "DeFi Protocol")`}
                                  className="bg-cyber-dark/30 border-cyber-cyan/30 text-white"
                                  disabled={isLoading}
                                />
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
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
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
