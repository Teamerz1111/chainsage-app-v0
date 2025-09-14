"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Pin, Trash2, Activity, AlertTriangle, CheckCircle, Clock, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { apiService } from "@/lib/api"

interface WatchlistItem {
  id: string
  label: string
  address: string
  riskScore: number
  lastEvent: string
  isPinned?: boolean
  chain: string
  type: "wallet" | "contract" | "project"
  balance?: number
  transactionCount?: number
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
  const [newItem, setNewItem] = useState({
    label: "",
    address: "",
    type: "wallet" as "wallet" | "contract" | "project",
    chain: "ethereum",
  })
  const [filter, setFilter] = useState<"all" | "pinned" | "high-risk">("all")

  // Load monitored wallets from backend API on mount
  useEffect(() => {
    loadMonitoredWallets()
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
              chain: "ethereum", // TODO: Detect chain from address
              type: "wallet" as const,
              balance: Math.floor(Math.random() * 1000000), // TODO: Get real balance
              transactionCount: wallet.alertCount || 0,
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
      // Start monitoring the wallet in the backend
      await apiService.startWalletMonitoring(newItem.address, 1000)

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

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(balance)
  }

  const filteredWatchlist = watchlist.filter((item) => {
    if (filter === "pinned") return item.isPinned
    if (filter === "high-risk") return item.riskScore >= 70
    return true
  })

  const isValidAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
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
                      <Badge variant="outline" className="text-xs capitalize border-gray-600 text-gray-300">
                        {item.type}
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
                        <div className="text-xs text-gray-500 mb-1">Last Activity</div>
                        <div className="flex items-center space-x-2 text-sm text-gray-300">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>{item.lastEvent}</span>
                        </div>
                      </div>
                      {item.balance && (
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Balance</div>
                          <div className="text-sm font-medium text-cyber-cyan">{formatBalance(item.balance)}</div>
                        </div>
                      )}
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Transactions</div>
                        <div className="text-sm font-medium text-gray-300">
                          {item.transactionCount?.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
    </Card>
  )
}
