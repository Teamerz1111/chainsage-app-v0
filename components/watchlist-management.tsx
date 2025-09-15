"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Pin, Trash2, Activity, AlertTriangle, CheckCircle, Clock, ExternalLink, Loader2, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"
import { apiService } from "@/lib/api"
import { wsService } from "@/lib/websocket"

interface WatchlistItem {
  id: string
  label: string
  address: string
  riskScore: number
  lastEvent: string
  isPinned?: boolean
  chain: string
  type: "wallet" | "contract" | "project" | "token"
  // Backend fields
  threshold?: number
  status?: string
  alertCount?: number
  monitoringSince?: number
  addedAt: string
}

const mockWatchlistData: WatchlistItem[] = [
  // {
  //   id: "w_01",
  //   label: "Project Alpha",
  //   address: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
  //   riskScore: 72,
  //   lastEvent: "3m ago",
  //   isPinned: true,
  //   chain: "ethereum",
  //   type: "project",
  //   balance: 1250000,
  //   transactionCount: 1847,
  //   addedAt: "2024-01-15",
  // },
  // {
  //   id: "w_02",
  //   label: "Whale #7",
  //   address: "0x8ba1f109551bD432803012645Hac136c22C57592",
  //   riskScore: 58,
  //   lastEvent: "12m ago",
  //   chain: "ethereum",
  //   type: "wallet",
  //   balance: 850000,
  //   transactionCount: 3421,
  //   addedAt: "2024-01-14",
  // },
  // {
  //   id: "w_03",
  //   label: "DeFi Protocol",
  //   address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
  //   riskScore: 25,
  //   lastEvent: "1h ago",
  //   chain: "ethereum",
  //   type: "contract",
  //   transactionCount: 15672,
  //   addedAt: "2024-01-13",
  // },
  // {
  //   id: "w_04",
  //   label: "Suspicious Wallet",
  //   address: "0x9f3a2b1c4d5e6f7890abcdef1234567890abcdef",
  //   riskScore: 89,
  //   lastEvent: "5m ago",
  //   chain: "polygon",
  //   type: "wallet",
  //   balance: 45000,
  //   transactionCount: 156,
  //   addedAt: "2024-01-12",
  // },
]

export function WatchlistManagement() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [analyzingAddress, setAnalyzingAddress] = useState<string | null>(null)
  const [analysisResults, setAnalysisResults] = useState<any>(null)
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false)
  const [newItem, setNewItem] = useState({
    label: "",
    address: "",
    type: "wallet" as "wallet" | "contract" | "project" | "token",
    chain: "ethereum",
  })

  // Chain to chainId mapping
  const getChainId = (chain: string): string => {
    switch (chain.toLowerCase()) {
      case 'ethereum': return '1'
      case 'polygon': return '137'
      case 'bsc': return '56'
      case 'arbitrum': return '42161'
      default: return '1' // Default to Ethereum
    }
  }

  // ChainId to chain name mapping
  const getChainFromId = (chainId: string): string => {
    switch (chainId) {
      case '1': return 'ethereum'
      case '137': return 'polygon'
      case '56': return 'bsc'
      case '42161': return 'arbitrum'
      default: return 'ethereum' // Default to Ethereum
    }
  }
  const [filter, setFilter] = useState<"all" | "pinned" | "high-risk">("all")

  // Load monitored wallets from backend API on mount and set up WebSocket
  useEffect(() => {
    loadMonitoredWallets()
    
    // Connect to WebSocket for real-time updates
    wsService.connect()
    
    // Subscribe to real-time wallet activity updates
    const unsubscribeActivity = wsService.subscribe('unusual_activity_detected', (message) => {
      console.log('Real-time activity update:', message)
      
      // Update the specific wallet's alert count and last activity
      setWatchlist(prev => prev.map(wallet => {
        if (wallet.address.toLowerCase() === message.walletAddress?.toLowerCase()) {
          return {
            ...wallet,
            alertCount: (wallet.alertCount || 0) + 1,
            lastEvent: "unusual activity detected",
            riskScore: Math.min(wallet.riskScore + 10, 100) // Increase risk score
          }
        }
        return wallet
      }))
    })
    
    // Subscribe to wallet monitoring status updates
    const unsubscribeStatus = wsService.subscribe('wallet_monitoring_update', (message) => {
      console.log('Wallet monitoring update:', message)
      // Reload the entire watchlist when wallets are added/removed elsewhere
      loadMonitoredWallets()
    })
    
    // Cleanup on unmount
    return () => {
      unsubscribeActivity()
      unsubscribeStatus()
    }
  }, [])

  const loadMonitoredWallets = async () => {
    try {
      setIsLoading(true)
      const response = await apiService.getMonitoredWallets()
      console.log('response', response)
      
      if (response.data && response.data.wallets) {
        // Convert backend wallet data to watchlist format and analyze each wallet
        const convertedWallets = await Promise.all(
          response.data.wallets.map(async (wallet: any) => {
            let riskScore = wallet.riskScore || 75; // Default to high risk if not available;
            
            try {
              // Get real risk analysis from backend
              const analysisResponse = await apiService.analyzeWallet(wallet.address)
              if (analysisResponse.data && analysisResponse.data.analysis) {
                const analysis = analysisResponse.data.analysis
                // Convert risk level to numeric score
                switch (analysis.riskLevel) {
                  case 'critical': riskScore >= 90; break;
                  case 'high': riskScore >= 75 && riskScore < 90; break;
                  case 'medium': riskScore >= 50 && riskScore < 75; break;
                  case 'low': riskScore >= 25 && riskScore < 50; break;
                  default: riskScore = Math.floor((analysis.confidence || 0.5) * 100);
                }
              }
            } catch (error) {
              console.warn(`Failed to analyze wallet ${wallet.address}:`, error)
              // Keep default risk score
            }
            
            return {
              id: wallet.address,
              label: `Wallet ${wallet.address.slice(0, 8)}...`,
              address: wallet.address,
              riskScore,
              lastEvent: wallet.lastChecked ? formatTimeAgo(wallet.lastChecked) : "just added",
              isPinned: false,
              chain: wallet.chainId ? getChainFromId(wallet.chainId) : "ethereum", // Use chainId from backend
              type: wallet.type || "wallet" as const,
              // Use actual backend data
              threshold: wallet.threshold,
              status: wallet.status,
              alertCount: wallet.alertCount || 0,
              monitoringSince: wallet.addedAt,
              addedAt: wallet.addedAt ? new Date(wallet.addedAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
            }
          })
        )
        
        setWatchlist(convertedWallets)
      }
    } catch (error) {
      console.error("Failed to load monitored wallets:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return "just now"
  }

  // Save watchlist to localStorage for offline access
  useEffect(() => {
    if (watchlist.length > 0) {
      localStorage.setItem("chainsage-watchlist", JSON.stringify(watchlist))
    }
  }, [watchlist])

  const addToWatchlist = async () => {
    if (!newItem.label || !newItem.address || !isValidAddress(newItem.address)) return

    try {
      // Start monitoring the item in the backend (wallet, token, etc.)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/wallet/monitor/${newItem.address}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          threshold: 1000,
          type: newItem.type,
          chainId: getChainId(newItem.chain)
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      // Reload the entire watchlist from the backend to ensure sync
      await loadMonitoredWallets()
      
      setNewItem({ label: "", address: "", type: "wallet", chain: "ethereum" })
      setIsAddModalOpen(false)
    } catch (error) {
      console.error('Failed to add to watchlist:', error)
    }
  }

  const removeFromWatchlist = async (id: string) => {
    const item = watchlist.find(w => w.id === id)
    if (item) {
      try {
        // Stop monitoring in the backend
        await apiService.stopWalletMonitoring(item.address)
        
        // Reload the entire watchlist from the backend to ensure sync
        await loadMonitoredWallets()
      } catch (error) {
        console.error('Failed to stop monitoring:', error)
      }
    }
  }

  const togglePin = (id: string) => {
    setWatchlist((prev) => prev.map((item) => (item.id === id ? { ...item, isPinned: !item.isPinned } : item)))
  }

  const getRiskColor = (score: number) => {
    if (score >= 80) return "text-red-400 bg-red-500/10 border-red-500/30"
    if (score >= 60) return "text-orange-400 bg-orange-500/10 border-orange-500/30"
    if (score >= 40) return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30"
    return "text-green-400 bg-green-500/10 border-green-500/30"
  }

  const getRiskIcon = (score: number) => {
    if (score >= 80) return <AlertTriangle className="h-4 w-4" />
    if (score >= 60) return <Activity className="h-4 w-4" />
    return <CheckCircle className="h-4 w-4" />
  }

  const getChainBadgeColor = (chain: string) => {
    switch (chain.toLowerCase()) {
      case "ethereum":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "polygon":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      case "bsc":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "arbitrum":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      default:
        return "bg-muted/20 text-muted-foreground border-muted/30"
    }
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "wallet":
        return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
      case "contract":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      case "token":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "project":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }


  const filteredWatchlist = watchlist.filter((item) => {
    if (filter === "pinned") return item.isPinned
    if (filter === "high-risk") return item.riskScore >= 70
    return true
  })

  const isValidAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }

  const handleAnalyzeWallet = async (address: string) => {
    setAnalyzingAddress(address)
    try {
      const response = await apiService.analyzeWallet(address)
      
      if (response.data) {
        setAnalysisResults({
          address,
          analysis: response.data.analysis,
          walletData: response.data.walletData,
          dataAvailability: response.data.dataAvailability
        })
        setIsAnalysisModalOpen(true)
      }
    } catch (error) {
      console.error('Failed to analyze wallet:', error)
      setAnalysisResults({
        address,
        error: error.message || 'Unknown error occurred',
        analysis: null,
        walletData: null
      })
      setIsAnalysisModalOpen(true)
    } finally {
      setAnalyzingAddress(null)
    }
  }

  return (
    <Card className="bg-cyber-dark/50 border-cyber-cyan/20">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-2xl font-serif text-white flex items-center gap-2">
              <Activity className="w-6 h-6 text-cyber-cyan" />
              Watchlist Management
            </CardTitle>
            <p className="text-gray-400 mt-1">Monitor wallets, contracts, and projects with real-time risk scoring</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              {["all", "pinned", "high-risk"].map((filterOption) => (
                <Button
                  key={filterOption}
                  variant={filter === filterOption ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(filterOption as typeof filter)}
                  className={cn(
                    "transition-all duration-200 capitalize",
                    filter === filterOption
                      ? "bg-cyber-cyan/20 text-cyber-cyan border-cyber-cyan/30"
                      : "hover:bg-cyber-cyan/10 hover:border-cyber-cyan/50 bg-transparent border-cyber-cyan/20 text-gray-300",
                  )}
                >
                  {filterOption.replace("-", " ")}
                </Button>
              ))}
            </div>

            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-cyber-green/20 border border-cyber-green/30 text-cyber-green hover:bg-cyber-green/30">
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Watchlist
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-cyber-cyan/20">
                <DialogHeader>
                  <DialogTitle className="text-white">Add to Watchlist</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="label" className="text-gray-300">
                      Label
                    </Label>
                    <Input
                      id="label"
                      placeholder="e.g., Whale Wallet, DeFi Protocol"
                      value={newItem.label}
                      onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
                      className="bg-gray-800 border-cyber-cyan/20 focus:border-cyber-cyan text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address" className="text-gray-300">
                      Address
                    </Label>
                    <Input
                      id="address"
                      placeholder="0x..."
                      value={newItem.address}
                      onChange={(e) => setNewItem({ ...newItem, address: e.target.value })}
                      className={cn(
                        "bg-gray-800 border-cyber-cyan/20 focus:border-cyber-cyan font-mono text-white",
                        newItem.address && !isValidAddress(newItem.address) && "border-red-400",
                      )}
                    />
                    {newItem.address && !isValidAddress(newItem.address) && (
                      <p className="text-sm text-red-400 mt-1">Invalid Ethereum address format</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="type" className="text-gray-300">
                        Type
                      </Label>
                      <select
                        id="type"
                        value={newItem.type}
                        onChange={(e) => setNewItem({ ...newItem, type: e.target.value as typeof newItem.type })}
                        className="w-full p-2 bg-gray-800 border border-cyber-cyan/20 rounded-md focus:border-cyber-cyan text-white"
                      >
                        <option value="wallet">Wallet</option>
                        <option value="contract">Contract</option>
                        <option value="token">ERC-20 Token</option>
                        <option value="project">Project</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="chain" className="text-gray-300">
                        Chain
                      </Label>
                      <select
                        id="chain"
                        value={newItem.chain}
                        onChange={(e) => setNewItem({ ...newItem, chain: e.target.value })}
                        className="w-full p-2 bg-gray-800 border border-cyber-cyan/20 rounded-md focus:border-cyber-cyan text-white"
                      >
                        <option value="ethereum">Ethereum</option>
                        <option value="polygon">Polygon</option>
                        <option value="bsc">BSC</option>
                        <option value="arbitrum">Arbitrum</option>
                      </select>
                    </div>
                  </div>
                  <Button
                    onClick={addToWatchlist}
                    disabled={!newItem.label || !newItem.address || !isValidAddress(newItem.address)}
                    className="w-full bg-cyber-cyan/20 border border-cyber-cyan/30 text-cyber-cyan hover:bg-cyber-cyan/30"
                  >
                    Add to Watchlist
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-12 w-12 border-4 border-cyber-cyan/20 border-t-cyber-cyan rounded-full mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-white mb-2">Loading monitored wallets...</h3>
            <p className="text-gray-400">Fetching data from 0G Storage</p>
          </div>
        ) : filteredWatchlist.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No items in watchlist</h3>
            <p className="text-gray-400 mb-4">Add wallets, contracts, or projects to start monitoring</p>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-cyber-cyan/20 border border-cyber-cyan/30 text-cyber-cyan hover:bg-cyber-cyan/30"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Item
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredWatchlist.map((item, index) => (
              <div
                key={item.id}
                className={cn(
                  "p-6 rounded-lg border bg-gray-800/30 hover:bg-gray-800/50 transition-all duration-200 group border-cyber-cyan/10",
                  item.isPinned && "ring-2 ring-cyber-cyan/30 bg-cyber-cyan/5",
                  index === 0 && watchlist[0]?.id === item.id && "animate-fade-in-up",
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-white">{item.label}</h3>
                      <Badge className={cn("text-xs capitalize", getChainBadgeColor(item.chain))}>{item.chain}</Badge>
                      <Badge className={cn("text-xs capitalize", getTypeBadgeColor(item.type))}>
                        {item.type === "token" ? "ERC-20" : item.type}
                      </Badge>
                      {item.isPinned && <Pin className="h-4 w-4 text-cyber-cyan" />}
                    </div>

                    <div className="font-mono text-sm text-gray-400 mb-3">{formatAddress(item.address)}</div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Risk Score</div>
                        <div
                          className={cn(
                            "flex items-center space-x-2 text-sm font-medium",
                            getRiskColor(item.riskScore),
                          )}
                        >
                          {getRiskIcon(item.riskScore)}
                          <span>{item.riskScore}/100</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Monitoring Status</div>
                        <div className="flex items-center space-x-2 text-sm">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            item.status === 'monitoring_active' ? "bg-cyber-green animate-pulse" : "bg-gray-500"
                          )} />
                          <span className="text-gray-300 capitalize">
                            {item.status?.replace('monitoring_', '') || 'Active'}
                          </span>
                        </div>
                      </div>
                      {item.threshold && (
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Alert Threshold</div>
                          <div className="text-sm font-medium text-amber-400">
                            ${item.threshold.toLocaleString()}
                          </div>
                        </div>
                      )}
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Alerts Triggered</div>
                        <div className="flex items-center space-x-2 text-sm">
                          <AlertTriangle className="h-4 w-4 text-amber-400" />
                          <span className="text-gray-300 font-medium">
                            {item.alertCount || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Additional info row */}
                    <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                      <div>
                        <span>Added: </span>
                        <span className="text-gray-400">{item.addedAt}</span>
                      </div>
                      {item.monitoringSince && (
                        <div>
                          <span>Monitoring: </span>
                          <span className="text-gray-400">{formatTimeAgo(item.monitoringSince)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAnalyzeWallet(item.address)}
                      disabled={analyzingAddress === item.address}
                      className="hover:bg-amber-500/10 hover:border-amber-500/50 bg-transparent border-gray-600 text-amber-400"
                      title="Analyze wallet activity and risk"
                    >
                      {analyzingAddress === item.address ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <BarChart3 className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => togglePin(item.id)}
                      className={cn(
                        "hover:bg-cyber-cyan/10 hover:border-cyber-cyan/50 bg-transparent border-gray-600",
                        item.isPinned && "bg-cyber-cyan/10 border-cyber-cyan/50",
                      )}
                    >
                      <Pin className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="hover:bg-gray-700/20 hover:border-gray-500/50 bg-transparent border-gray-600 text-gray-300"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFromWatchlist(item.id)}
                      className="hover:bg-red-500/10 hover:border-red-500/50 bg-transparent text-red-400 border-gray-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      {/* Analysis Results Modal */}
      <Dialog open={isAnalysisModalOpen} onOpenChange={setIsAnalysisModalOpen}>
        <DialogContent className="bg-slate-900 border-cyber-cyan/20 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-400" />
              Wallet Analysis Results
            </DialogTitle>
          </DialogHeader>
          
          {analysisResults && (
            <div className="space-y-6">
              {/* Header with address */}
              <div className="flex items-center justify-between p-4 bg-cyber-dark/30 rounded border border-cyber-cyan/10">
                <div>
                  <h3 className="text-white font-medium">Wallet Address</h3>
                  <p className="font-mono text-sm text-cyber-cyan">{analysisResults.address}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`https://etherscan.io/address/${analysisResults.address}`, '_blank')}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Etherscan
                </Button>
              </div>

              {analysisResults.error ? (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded">
                  <div className="flex items-center gap-2 text-red-400 mb-2">
                    <AlertTriangle className="w-5 h-5" />
                    <h4 className="font-medium">Analysis Failed</h4>
                  </div>
                  <p className="text-red-300">{analysisResults.error}</p>
                </div>
              ) : (
                <>
                  {/* Risk Assessment */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-cyber-dark/30 rounded border border-cyber-cyan/10">
                      <h4 className="text-white font-medium mb-3">Risk Assessment</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Risk Level</span>
                          <Badge className={cn(
                            "text-xs font-medium",
                            analysisResults.analysis?.riskLevel === 'critical' && "bg-red-500/20 text-red-400 border-red-500/30",
                            analysisResults.analysis?.riskLevel === 'high' && "bg-orange-500/20 text-orange-400 border-orange-500/30",
                            analysisResults.analysis?.riskLevel === 'medium' && "bg-amber-500/20 text-amber-400 border-amber-500/30",
                            analysisResults.analysis?.riskLevel === 'low' && "bg-green-500/20 text-green-400 border-green-500/30"
                          )}>
                            {analysisResults.analysis?.riskLevel?.toUpperCase() || 'UNKNOWN'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Confidence</span>
                          <span className="text-white">{((analysisResults.analysis?.confidence || 0) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Analysis Type</span>
                          <Badge variant="outline" className="text-xs border-gray-500/30 text-gray-300">
                            {analysisResults.analysis?.fallbackAnalysis ? 'Rule-based' : 'AI-powered'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-cyber-dark/30 rounded border border-cyber-cyan/10">
                      <h4 className="text-white font-medium mb-3">Activity Metrics</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Daily Transactions</span>
                          <span className="text-white">{analysisResults.walletData?.dailyTxCount || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Daily Volume</span>
                          <span className="text-white">{analysisResults.walletData?.dailyVolumeEth || '0'} ETH</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Current Balance</span>
                          <span className="text-white">{analysisResults.walletData?.currentBalanceEth || '0'} ETH</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Historical Data */}
                  <div className="p-4 bg-cyber-dark/30 rounded border border-cyber-cyan/10">
                    <h4 className="text-white font-medium mb-3">Historical Data</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-cyber-cyan">{analysisResults.walletData?.totalTransactions || 0}</div>
                        <div className="text-xs text-gray-400">Total Transactions</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">{analysisResults.walletData?.totalTokenTransfers || 0}</div>
                        <div className="text-xs text-gray-400">Token Transfers</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-amber-400">
                          {analysisResults.dataAvailability?.transactionsAvailable ? '✓' : '✗'}
                        </div>
                        <div className="text-xs text-gray-400">TX Data Available</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-400">
                          {analysisResults.dataAvailability?.aiAnalysisUsed ? '✓' : '✗'}
                        </div>
                        <div className="text-xs text-gray-400">AI Analysis Used</div>
                      </div>
                    </div>
                  </div>

                  {/* Anomalies */}
                  {analysisResults.analysis?.anomalies && analysisResults.analysis.anomalies.length > 0 && (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded">
                      <h4 className="text-amber-400 font-medium mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Detected Anomalies
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {analysisResults.analysis.anomalies.map((anomaly: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs border-amber-400/30 text-amber-400">
                            {anomaly.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Analysis Reasoning */}
                  {analysisResults.analysis?.reason && (
                    <div className="p-4 bg-cyber-dark/30 rounded border border-cyber-cyan/10">
                      <h4 className="text-white font-medium mb-2">Analysis Reasoning</h4>
                      <p className="text-gray-300 text-sm">{analysisResults.analysis.reason}</p>
                    </div>
                  )}
                </>
              )}
              
              {/* Close Button */}
              <div className="flex justify-end pt-4 border-t border-cyber-cyan/20">
                <Button
                  onClick={() => setIsAnalysisModalOpen(false)}
                  className="bg-cyber-cyan/20 border border-cyber-cyan/30 text-cyber-cyan hover:bg-cyber-cyan/30"
                >
                  Close Analysis
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}
