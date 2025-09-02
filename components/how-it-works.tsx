"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Database, Shield, Zap, RefreshCw, Globe, Clock, AlertTriangle, CheckCircle } from "lucide-react"

const apiProviders = [
  {
    name: "Etherscan",
    description: "Ethereum blockchain explorer and analytics platform",
    features: ["Transaction Data", "Contract Verification", "Token Analytics"],
    logo: "🔍",
  },
  {
    name: "Moralis",
    description: "Web3 development platform with comprehensive APIs",
    features: ["Multi-chain Support", "NFT Data", "DeFi Analytics"],
    logo: "⚡",
  },
  {
    name: "Covalent",
    description: "Unified API for blockchain data across multiple networks",
    features: ["Historical Data", "Portfolio Tracking", "Cross-chain Analytics"],
    logo: "🌐",
  },
  {
    name: "Reservoir",
    description: "NFT infrastructure and marketplace aggregation",
    features: ["NFT Metadata", "Market Data", "Collection Analytics"],
    logo: "💎",
  },
]

const riskHeuristics = [
  {
    name: "Large Transfers",
    description: "Monitors unusual transaction volumes and whale movements",
    severity: "High",
    icon: AlertTriangle,
  },
  {
    name: "New Contracts",
    description: "Flags interactions with recently deployed or unverified contracts",
    severity: "Medium",
    icon: Shield,
  },
  {
    name: "Flash Loans",
    description: "Detects complex flash loan patterns and potential MEV activities",
    severity: "High",
    icon: Zap,
  },
  {
    name: "Honeypot Detection",
    description: "Identifies tokens with suspicious trading restrictions",
    severity: "Critical",
    icon: AlertTriangle,
  },
  {
    name: "Governance Risks",
    description: "Analyzes DAO proposals for potential security implications",
    severity: "Medium",
    icon: CheckCircle,
  },
]

const getSeverityColor = (severity: string) => {
  switch (severity.toLowerCase()) {
    case "critical":
      return "bg-red-500/20 text-red-400 border-red-500/30"
    case "high":
      return "bg-orange-500/20 text-orange-400 border-orange-500/30"
    case "medium":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    default:
      return "bg-green-500/20 text-green-400 border-green-500/30"
  }
}

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold font-serif text-primary neon-text mb-4">How It Works</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            0g-Sygna aggregates data from multiple blockchain APIs and applies advanced risk detection algorithms to
            provide real-time on-chain intelligence
          </p>
        </div>

        <div className="grid gap-8 mb-16">
          {/* Data Sources */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Database className="h-6 w-6 text-primary" />
                <CardTitle className="text-2xl font-serif text-foreground">Data Sources</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {apiProviders.map((provider) => (
                  <div
                    key={provider.name}
                    className="p-4 rounded-lg border border-border/50 bg-background/30 hover:bg-background/50 transition-all duration-200"
                  >
                    <div className="text-center mb-4">
                      <div className="text-3xl mb-2">{provider.logo}</div>
                      <h3 className="font-semibold text-foreground">{provider.name}</h3>
                      <p className="text-sm text-muted-foreground mt-2">{provider.description}</p>
                    </div>
                    <div className="space-y-2">
                      {provider.features.map((feature) => (
                        <Badge
                          key={feature}
                          variant="outline"
                          className="text-xs bg-background/50 w-full justify-center"
                        >
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Update Cadence */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <RefreshCw className="h-6 w-6 text-secondary" />
                <CardTitle className="text-2xl font-serif text-foreground">Update Cadence</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 rounded-lg border border-border/50 bg-background/30">
                  <Clock className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-2">Real-time</h3>
                  <p className="text-sm text-muted-foreground mb-3">Critical alerts and high-value transactions</p>
                  <Badge className="bg-primary/20 text-primary border-primary/30">{"< 30 seconds"}</Badge>
                </div>
                <div className="text-center p-6 rounded-lg border border-border/50 bg-background/30">
                  <RefreshCw className="h-8 w-8 text-secondary mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-2">Activity Feed</h3>
                  <p className="text-sm text-muted-foreground mb-3">General transaction and event monitoring</p>
                  <Badge className="bg-secondary/20 text-secondary border-secondary/30">10 seconds</Badge>
                </div>
                <div className="text-center p-6 rounded-lg border border-border/50 bg-background/30">
                  <Globe className="h-8 w-8 text-chart-3 mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-2">Analytics</h3>
                  <p className="text-sm text-muted-foreground mb-3">Portfolio and historical data updates</p>
                  <Badge className="bg-chart-3/20 text-chart-3 border-chart-3/30">5 minutes</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk Detection */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Shield className="h-6 w-6 text-orange-400" />
                <CardTitle className="text-2xl font-serif text-foreground">Risk Detection Algorithms</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {riskHeuristics.map((heuristic) => {
                  const Icon = heuristic.icon
                  return (
                    <div
                      key={heuristic.name}
                      className="flex items-start space-x-4 p-4 rounded-lg border border-border/50 bg-background/30 hover:bg-background/50 transition-all duration-200"
                    >
                      <div className="flex-shrink-0">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-foreground">{heuristic.name}</h3>
                          <Badge className={getSeverityColor(heuristic.severity)}>{heuristic.severity}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{heuristic.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
