"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, Repeat, ImageIcon, Droplets, ExternalLink, Filter } from "lucide-react"
import { cn } from "@/lib/utils"
import { apiService } from "@/lib/api"
import { wsService } from "@/lib/websocket"

type ActivityType = "transaction" | "nft" | "liquidity"

interface ActivityItem {
  id: string
  type: ActivityType
  hash?: string
  from?: string
  to?: string
  valueUsd?: number
  time: string
  chain: string
  contract?: string
  tokenId?: string
  event?: string
  pool?: string
  action?: string
  amountUsd?: number
  dex?: string
}

const mockActivityData: ActivityItem[] = [
  {
    id: "tx_01",
    type: "transaction",
    hash: "0x1a2b3c4d5e6f7890abcdef1234567890abcdef12",
    from: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
    to: "0x8ba1f109551bD432803012645Hac136c22C57592",
    valueUsd: 12450.23,
    time: "30s ago",
    chain: "ethereum",
  },
  {
    id: "nft_01",
    type: "nft",
    contract: "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",
    tokenId: "3421",
    event: "Transfer",
    from: "0x3333333333333333333333333333333333333333",
    to: "0x4444444444444444444444444444444444444444",
    time: "2m ago",
    chain: "ethereum",
  },
  {
    id: "liq_01",
    type: "liquidity",
    pool: "USDC/WETH",
    action: "Add",
    amountUsd: 50231.77,
    time: "4m ago",
    dex: "Uniswap",
    chain: "ethereum",
  },
  {
    id: "tx_02",
    type: "transaction",
    hash: "0x9876543210fedcba0987654321fedcba09876543",
    from: "0x9f3a2b1c4d5e6f7890abcdef1234567890abcdef",
    to: "0x1234567890abcdef1234567890abcdef12345678",
    valueUsd: 850.75,
    time: "5m ago",
    chain: "polygon",
  },
  {
    id: "nft_02",
    type: "nft",
    contract: "0x60E4d786628Fea6478F785A6d7e704777c86a7c6",
    tokenId: "1337",
    event: "Sale",
    from: "0x5555555555555555555555555555555555555555",
    to: "0x6666666666666666666666666666666666666666",
    time: "7m ago",
    chain: "ethereum",
  },
  {
    id: "liq_02",
    type: "liquidity",
    pool: "MATIC/USDT",
    action: "Remove",
    amountUsd: 15420.33,
    time: "9m ago",
    dex: "QuickSwap",
    chain: "polygon",
  },
]

const filterOptions = [
  { value: "all", label: "All", icon: Filter },
  { value: "transaction", label: "Transactions", icon: ArrowUpRight },
  { value: "nft", label: "NFTs", icon: ImageIcon },
  { value: "liquidity", label: "Liquidity", icon: Droplets },
]

export function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [selectedFilter, setSelectedFilter] = useState<string>("all")
  const [expandedItem, setExpandedItem] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load initial data and set up polling
  useEffect(() => {
    const loadActivities = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get recent activity data from 0G blockchain
        const result = await apiService.retrieve0GData({
          type: 'ai_classification',
          limit: 20,
          page: 1
        })

        if (result.error) {
          setError(result.error)
          // Fallback to mock data on error
          setActivities(mockActivityData)
        } else if (result.data?.logs) {
          // Transform backend data to frontend format
          const transformedActivities: ActivityItem[] = result.data.logs.map((log: any, index: number) => ({
            id: log.transactionHash || `activity_${index}`,
            type: "transaction" as ActivityType,
            hash: log.transactionHash,
            from: log.originalTransaction?.from,
            to: log.originalTransaction?.to,
            valueUsd: log.originalTransaction?.value ? parseFloat(log.originalTransaction.value) / 1e18 * 2000 : Math.random() * 10000, // Rough ETH to USD conversion
            time: log.timestamp ? new Date(log.timestamp).toLocaleString() : "Unknown",
            chain: "ethereum", // Default to ethereum for now
          }))
          setActivities(transformedActivities)
        } else {
          // No data available, use mock data
          setActivities(mockActivityData)
        }
      } catch (err) {
        console.error('Failed to load activities:', err)
        setError('Failed to load activities')
        setActivities(mockActivityData)
      } finally {
        setLoading(false)
      }
    }

    loadActivities()

    // Set up WebSocket connection for real-time updates
    wsService.connect()
    const unsubscribe = wsService.subscribe('unusual_activity_detected', (message) => {
      // Add new activity to the top of the list
      const newActivity: ActivityItem = {
        id: `ws_${Date.now()}`,
        type: "transaction",
        hash: message.data.walletData?.recentTransactions?.[0]?.hash || `0x${Date.now().toString(16)}`,
        from: message.data.walletAddress,
        to: message.data.walletData?.recentTransactions?.[0]?.to || "Unknown",
        valueUsd: Math.random() * 10000,
        time: "just now",
        chain: "ethereum",
      }
      
      setActivities(prev => [newActivity, ...prev.slice(0, 19)])
    })

    // Poll for updates every 30 seconds as backup
    const interval = setInterval(loadActivities, 30000)
    
    return () => {
      clearInterval(interval)
      unsubscribe()
    }
  }, [])

  const filteredActivities = activities.filter((activity) =>
    selectedFilter === "all" ? true : activity.type === selectedFilter,
  )

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case "transaction":
        return <ArrowUpRight className="h-4 w-4 text-primary" />
      case "nft":
        return <ImageIcon className="h-4 w-4 text-secondary" />
      case "liquidity":
        return <Droplets className="h-4 w-4 text-chart-3" />
      default:
        return <Repeat className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getChainBadgeColor = (chain: string) => {
    switch (chain.toLowerCase()) {
      case "ethereum":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "polygon":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      case "arbitrum":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      default:
        return "bg-muted/20 text-muted-foreground border-muted/30"
    }
  }

  const formatAddress = (address?: string) => {
    if (!address) return "Unknown"
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatValue = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  return (
    <section id="activity" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold font-serif text-primary neon-text mb-4">Live Activity Feed</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Real-time blockchain transactions, NFT events, and liquidity changes across multiple chains
          </p>
        </div>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="text-2xl font-serif text-foreground">Latest Activity</CardTitle>
              <div className="flex flex-wrap gap-2">
                {filterOptions.map((option) => {
                  const Icon = option.icon
                  return (
                    <Button
                      key={option.value}
                      variant={selectedFilter === option.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedFilter(option.value)}
                      className={cn(
                        "transition-all duration-200",
                        selectedFilter === option.value
                          ? "bg-primary text-primary-foreground neon-glow"
                          : "hover:bg-accent/20 hover:border-primary/50",
                      )}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {option.label}
                    </Button>
                  )
                })}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Loading activities...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <p className="text-destructive mb-2">Error: {error}</p>
                <p className="text-muted-foreground text-sm">Showing demo data</p>
              </div>
            ) : null}
            <div className="space-y-1">
              {filteredActivities.map((activity, index) => (
                <div
                  key={activity.id}
                  className={cn(
                    "p-4 border-b border-border/30 hover:bg-accent/10 transition-all duration-200 cursor-pointer",
                    expandedItem === activity.id && "bg-accent/20",
                    index === 0 && "animate-fade-in-up",
                  )}
                  onClick={() => setExpandedItem(expandedItem === activity.id ? null : activity.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">{getActivityIcon(activity.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-foreground capitalize">{activity.type}</span>
                          <Badge className={cn("text-xs", getChainBadgeColor(activity.chain))}>{activity.chain}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {activity.type === "transaction" && activity.from && activity.to && (
                            <>
                              {formatAddress(activity.from)} → {formatAddress(activity.to)}
                            </>
                          )}
                          {activity.type === "nft" && (
                            <>
                              {activity.event} #{activity.tokenId} • {formatAddress(activity.contract)}
                            </>
                          )}
                          {activity.type === "liquidity" && (
                            <>
                              {activity.action} {activity.pool} • {activity.dex}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {(activity.valueUsd || activity.amountUsd) && (
                        <div className="text-right">
                          <div className="font-semibold text-primary">
                            {formatValue(activity.valueUsd || activity.amountUsd!)}
                          </div>
                        </div>
                      )}
                      <div className="text-sm text-muted-foreground whitespace-nowrap">{activity.time}</div>
                    </div>
                  </div>

                  {expandedItem === activity.id && (
                    <div className="mt-4 pt-4 border-t border-border/30 animate-fade-in-up">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {activity.hash && (
                          <div>
                            <span className="text-muted-foreground">Transaction Hash:</span>
                            <div className="font-mono text-primary break-all">{activity.hash}</div>
                          </div>
                        )}
                        {activity.from && (
                          <div>
                            <span className="text-muted-foreground">From:</span>
                            <div className="font-mono text-foreground break-all">{activity.from}</div>
                          </div>
                        )}
                        {activity.to && (
                          <div>
                            <span className="text-muted-foreground">To:</span>
                            <div className="font-mono text-foreground break-all">{activity.to}</div>
                          </div>
                        )}
                        {activity.contract && (
                          <div>
                            <span className="text-muted-foreground">Contract:</span>
                            <div className="font-mono text-foreground break-all">{activity.contract}</div>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          className="hover:bg-primary/10 hover:border-primary/50 bg-transparent"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View on Explorer
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
