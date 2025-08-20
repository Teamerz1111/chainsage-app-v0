"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Search,
  Wallet,
  FileText,
  Activity,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Copy,
  Plus,
  TrendingUp,
  ArrowUpRight,
  ImageIcon,
  Droplets,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SearchResult {
  address: string
  type: "wallet" | "contract" | "token"
  balance: number
  transactionCount: number
  labels: string[]
  riskScore: number
  chain: string
  firstSeen: string
  lastActivity: string
  recentEvents: RecentEvent[]
  contractInfo?: {
    name?: string
    symbol?: string
    verified: boolean
    creator: string
  }
}

interface RecentEvent {
  id: string
  type: "transaction" | "nft" | "liquidity" | "contract_call"
  hash: string
  from: string
  to: string
  value?: number
  time: string
  method?: string
  status: "success" | "failed"
}

const mockSearchResults: Record<string, SearchResult> = {
  "0x742d35cc6634c0532925a3b8d4c0532925a3b8d4": {
    address: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
    type: "wallet",
    balance: 1250000,
    transactionCount: 1847,
    labels: ["Whale", "DeFi User", "Early Adopter"],
    riskScore: 25,
    chain: "ethereum",
    firstSeen: "2021-03-15",
    lastActivity: "3m ago",
    recentEvents: [
      {
        id: "1",
        type: "transaction",
        hash: "0x1a2b3c4d5e6f7890abcdef1234567890abcdef12",
        from: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
        to: "0x8ba1f109551bD432803012645Hac136c22C57592",
        value: 12450.23,
        time: "3m ago",
        status: "success",
      },
      {
        id: "2",
        type: "contract_call",
        hash: "0x2b3c4d5e6f7890abcdef1234567890abcdef1234",
        from: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
        to: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
        method: "swap",
        time: "15m ago",
        status: "success",
      },
      {
        id: "3",
        type: "nft",
        hash: "0x3c4d5e6f7890abcdef1234567890abcdef123456",
        from: "0x0000000000000000000000000000000000000000",
        to: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
        time: "1h ago",
        status: "success",
      },
    ],
  },
  "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984": {
    address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    type: "contract",
    balance: 0,
    transactionCount: 2847291,
    labels: ["Uniswap", "DEX", "Verified"],
    riskScore: 15,
    chain: "ethereum",
    firstSeen: "2020-09-17",
    lastActivity: "1m ago",
    contractInfo: {
      name: "Uniswap Token",
      symbol: "UNI",
      verified: true,
      creator: "0x1a9C8182C09F50C8318d769245beA52c32BE35BC",
    },
    recentEvents: [
      {
        id: "1",
        type: "contract_call",
        hash: "0x4d5e6f7890abcdef1234567890abcdef12345678",
        from: "0x8ba1f109551bD432803012645Hac136c22C57592",
        to: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
        method: "transfer",
        value: 1000,
        time: "1m ago",
        status: "success",
      },
      {
        id: "2",
        type: "contract_call",
        hash: "0x5e6f7890abcdef1234567890abcdef1234567890",
        from: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
        to: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
        method: "approve",
        time: "5m ago",
        status: "success",
      },
    ],
  },
}

export function SearchPanel() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState("")

  const isValidAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError("Please enter an address or contract")
      return
    }

    if (!isValidAddress(searchQuery)) {
      setError("Invalid Ethereum address format")
      return
    }

    setIsSearching(true)
    setError("")

    // Simulate API call
    setTimeout(() => {
      const result = mockSearchResults[searchQuery.toLowerCase()]
      if (result) {
        setSearchResult(result)
      } else {
        // Generate mock result for unknown addresses
        setSearchResult({
          address: searchQuery,
          type: "wallet",
          balance: Math.floor(Math.random() * 100000),
          transactionCount: Math.floor(Math.random() * 1000),
          labels: ["Unknown"],
          riskScore: Math.floor(Math.random() * 100),
          chain: "ethereum",
          firstSeen: "2023-01-01",
          lastActivity: "Unknown",
          recentEvents: [],
        })
      }
      setIsSearching(false)
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
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

  const getEventIcon = (type: string) => {
    switch (type) {
      case "transaction":
        return <ArrowUpRight className="h-4 w-4 text-primary" />
      case "nft":
        return <ImageIcon className="h-4 w-4 text-secondary" />
      case "liquidity":
        return <Droplets className="h-4 w-4 text-chart-3" />
      case "contract_call":
        return <FileText className="h-4 w-4 text-chart-4" />
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <section id="search" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold font-serif text-primary neon-text mb-4">Address Search</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Search and analyze any Ethereum address or contract with comprehensive on-chain data
          </p>
        </div>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50 mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-serif text-foreground">Search Address or Contract</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Enter Ethereum address (0x...)"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setError("")
                  }}
                  onKeyPress={handleKeyPress}
                  className={cn(
                    "font-mono bg-input border-border focus:border-primary",
                    error && "border-destructive focus:border-destructive",
                  )}
                />
                {error && <p className="text-sm text-destructive mt-2">{error}</p>}
              </div>
              <Button
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
                className="bg-primary text-primary-foreground hover:bg-primary/90 neon-glow"
              >
                {isSearching ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                {isSearching ? "Searching..." : "Search"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {searchResult && (
          <div className="space-y-6 animate-fade-in-up">
            {/* Address Summary */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-serif text-foreground">Address Summary</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(searchResult.address)}
                      className="hover:bg-accent/20 bg-transparent"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="hover:bg-primary/10 hover:border-primary/50 bg-transparent"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add to Watchlist
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Wallet className="h-5 w-5 text-primary" />
                      <span className="font-medium text-foreground">Address</span>
                    </div>
                    <div className="font-mono text-sm text-muted-foreground break-all">{searchResult.address}</div>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge className="text-xs capitalize bg-blue-500/20 text-blue-400 border-blue-500/30">
                        {searchResult.chain}
                      </Badge>
                      <Badge className="text-xs capitalize" variant="outline">
                        {searchResult.type}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-secondary" />
                      <span className="font-medium text-foreground">Balance</span>
                    </div>
                    <div className="text-2xl font-bold text-primary">{formatBalance(searchResult.balance)}</div>
                    <div className="text-sm text-muted-foreground">Current USD value</div>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Activity className="h-5 w-5 text-chart-3" />
                      <span className="font-medium text-foreground">Transactions</span>
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      {searchResult.transactionCount.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Total count</div>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      {getRiskIcon(searchResult.riskScore)}
                      <span className="font-medium text-foreground">Risk Score</span>
                    </div>
                    <div className={cn("text-2xl font-bold", getRiskColor(searchResult.riskScore))}>
                      {searchResult.riskScore}/100
                    </div>
                    <div className="text-sm text-muted-foreground">Security assessment</div>
                  </div>
                </div>

                {/* Labels */}
                <div className="mt-6">
                  <h4 className="font-medium text-foreground mb-3">Labels & Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {searchResult.labels.map((label) => (
                      <Badge key={label} variant="outline" className="bg-background/50">
                        {label}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Contract Info */}
                {searchResult.contractInfo && (
                  <div className="mt-6 p-4 bg-accent/10 rounded-lg border border-border/50">
                    <h4 className="font-medium text-foreground mb-3">Contract Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Name:</span>
                        <div className="font-medium">{searchResult.contractInfo.name}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Symbol:</span>
                        <div className="font-medium">{searchResult.contractInfo.symbol}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Verified:</span>
                        <div className="flex items-center space-x-2">
                          {searchResult.contractInfo.verified ? (
                            <CheckCircle className="h-4 w-4 text-green-400" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-orange-400" />
                          )}
                          <span>{searchResult.contractInfo.verified ? "Yes" : "No"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Events */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-xl font-serif text-foreground">Recent Events</CardTitle>
              </CardHeader>
              <CardContent>
                {searchResult.recentEvents.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Transaction</TableHead>
                        <TableHead>From/To</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {searchResult.recentEvents.map((event) => (
                        <TableRow key={event.id} className="hover:bg-accent/10">
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getEventIcon(event.type)}
                              <span className="capitalize">{event.type.replace("_", " ")}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-mono text-sm">{formatAddress(event.hash)}</div>
                            {event.method && <div className="text-xs text-muted-foreground">{event.method}</div>}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-mono">{formatAddress(event.from)}</div>
                              <div className="text-muted-foreground">→</div>
                              <div className="font-mono">{formatAddress(event.to)}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {event.value && (
                              <div className="font-medium text-primary">{formatBalance(event.value)}</div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground">{event.time}</div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={cn(
                                "text-xs",
                                event.status === "success"
                                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                                  : "bg-red-500/20 text-red-400 border-red-500/30",
                              )}
                            >
                              {event.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" className="hover:bg-accent/20">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No Recent Events</h3>
                    <p className="text-muted-foreground">No recent activity found for this address</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </section>
  )
}
