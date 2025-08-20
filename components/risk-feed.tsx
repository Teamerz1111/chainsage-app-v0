"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Shield, Eye, EyeOff, Clock, TrendingDown, Zap, Users } from "lucide-react"
import { cn } from "@/lib/utils"

type RiskSeverity = "Low" | "Medium" | "High" | "Critical"

interface RiskAlert {
  id: string
  severity: RiskSeverity
  title: string
  detail: string
  tags: string[]
  time: string
  acknowledged?: boolean
  chain?: string
}

const mockRiskData: RiskAlert[] = [
  {
    id: "r_01",
    severity: "High",
    title: "Large Outflow Detected",
    detail: "Wallet 0x9f3a...2b1c moved $420,000 to centralized exchange",
    tags: ["Whale", "CEX", "Large Transfer"],
    time: "1m ago",
    chain: "ethereum",
  },
  {
    id: "r_02",
    severity: "Medium",
    title: "New Contract Interaction",
    detail: "Monitored wallet interacted with newly deployed contract 0x1234...5678",
    tags: ["New Contract", "Unverified"],
    time: "6m ago",
    chain: "ethereum",
  },
  {
    id: "r_03",
    severity: "Critical",
    title: "Suspicious Token Activity",
    detail: "Token contract shows honeypot characteristics - 95% sell failure rate",
    tags: ["Honeypot", "Scam", "Token"],
    time: "12m ago",
    chain: "bsc",
  },
  {
    id: "r_04",
    severity: "High",
    title: "Flash Loan Attack Pattern",
    detail: "Multiple flash loans executed in single transaction with unusual profit margins",
    tags: ["Flash Loan", "MEV", "Arbitrage"],
    time: "18m ago",
    chain: "ethereum",
  },
  {
    id: "r_05",
    severity: "Low",
    title: "Unusual Trading Volume",
    detail: "Token RISK shows 300% volume increase in last hour",
    tags: ["Volume Spike", "Trading"],
    time: "25m ago",
    chain: "polygon",
  },
  {
    id: "r_06",
    severity: "Medium",
    title: "Governance Proposal Risk",
    detail: "High-risk governance proposal detected with potential fund drainage",
    tags: ["Governance", "DAO", "Proposal"],
    time: "32m ago",
    chain: "arbitrum",
  },
]

const severityConfig = {
  Critical: {
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    ringColor: "ring-red-500/50",
    icon: AlertTriangle,
  },
  High: {
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
    ringColor: "ring-orange-500/50",
    icon: TrendingDown,
  },
  Medium: {
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/30",
    ringColor: "ring-yellow-500/50",
    icon: Eye,
  },
  Low: {
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    ringColor: "ring-blue-500/50",
    icon: Shield,
  },
}

const tagIcons: Record<string, any> = {
  Whale: Users,
  CEX: TrendingDown,
  "Flash Loan": Zap,
  Honeypot: AlertTriangle,
  Scam: AlertTriangle,
  "New Contract": Shield,
  Governance: Users,
  MEV: Zap,
}

export function RiskFeed() {
  const [alerts, setAlerts] = useState<RiskAlert[]>(mockRiskData)
  const [filter, setFilter] = useState<RiskSeverity | "All">("All")

  // Simulate new risk alerts
  useEffect(() => {
    const interval = setInterval(() => {
      const severities: RiskSeverity[] = ["Low", "Medium", "High", "Critical"]
      const titles = [
        "Unusual Transaction Pattern",
        "Smart Contract Risk",
        "Liquidity Pool Manipulation",
        "Suspicious Wallet Activity",
        "Token Price Anomaly",
      ]
      const chains = ["ethereum", "polygon", "bsc", "arbitrum"]

      const newAlert: RiskAlert = {
        id: `risk_${Date.now()}`,
        severity: severities[Math.floor(Math.random() * severities.length)],
        title: titles[Math.floor(Math.random() * titles.length)],
        detail: "Automated risk detection system flagged this activity for review",
        tags: ["Automated", "Detection"],
        time: "just now",
        chain: chains[Math.floor(Math.random() * chains.length)],
      }

      setAlerts((prev) => [newAlert, ...prev.slice(0, 19)]) // Keep only 20 alerts
    }, 15000) // New alert every 15 seconds

    return () => clearInterval(interval)
  }, [])

  const filteredAlerts = alerts.filter((alert) => (filter === "All" ? true : alert.severity === filter))

  const acknowledgeAlert = (alertId: string) => {
    setAlerts((prev) => prev.map((alert) => (alert.id === alertId ? { ...alert, acknowledged: true } : alert)))
  }

  const getChainBadgeColor = (chain: string) => {
    switch (chain?.toLowerCase()) {
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

  const severityFilters: (RiskSeverity | "All")[] = ["All", "Critical", "High", "Medium", "Low"]

  return (
    <section id="risk" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold font-serif text-primary neon-text mb-4">Risk Feed</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Real-time security alerts and risk detection across blockchain networks
          </p>
        </div>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="text-2xl font-serif text-foreground">Security Alerts</CardTitle>
              <div className="flex flex-wrap gap-2">
                {severityFilters.map((severity) => (
                  <Button
                    key={severity}
                    variant={filter === severity ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter(severity)}
                    className={cn(
                      "transition-all duration-200",
                      filter === severity
                        ? "bg-primary text-primary-foreground neon-glow"
                        : "hover:bg-accent/20 hover:border-primary/50",
                    )}
                  >
                    {severity}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredAlerts.map((alert, index) => {
              const config = severityConfig[alert.severity]
              const SeverityIcon = config.icon

              return (
                <div
                  key={alert.id}
                  className={cn(
                    "relative p-6 rounded-lg border transition-all duration-200 hover:shadow-lg group",
                    config.bgColor,
                    config.borderColor,
                    alert.acknowledged ? "opacity-60" : "hover:scale-[1.02]",
                    index === 0 && "animate-fade-in-up",
                  )}
                >
                  {/* Severity Ring */}
                  <div
                    className={cn(
                      "absolute -top-2 -left-2 w-4 h-4 rounded-full ring-4 ring-offset-2 ring-offset-background",
                      config.bgColor.replace("/10", ""),
                      config.ringColor,
                    )}
                  />

                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <SeverityIcon className={cn("h-5 w-5", config.color)} />
                        <h3 className="font-semibold text-foreground">{alert.title}</h3>
                        <Badge className={cn("text-xs font-medium", config.color, config.bgColor, config.borderColor)}>
                          {alert.severity}
                        </Badge>
                        {alert.chain && (
                          <Badge className={cn("text-xs", getChainBadgeColor(alert.chain))}>{alert.chain}</Badge>
                        )}
                      </div>

                      <p className="text-muted-foreground mb-4 leading-relaxed">{alert.detail}</p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {alert.tags.map((tag) => {
                          const TagIcon = tagIcons[tag]
                          return (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-xs bg-background/50 border-border/50 hover:bg-accent/20 transition-colors"
                            >
                              {TagIcon && <TagIcon className="h-3 w-3 mr-1" />}
                              {tag}
                            </Badge>
                          )
                        })}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{alert.time}</span>
                        </div>

                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!alert.acknowledged ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => acknowledgeAlert(alert.id)}
                              className="hover:bg-primary/10 hover:border-primary/50 bg-transparent"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Acknowledge
                            </Button>
                          ) : (
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <EyeOff className="h-4 w-4" />
                              <span>Acknowledged</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            {filteredAlerts.length === 0 && (
              <div className="text-center py-12">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No {filter.toLowerCase()} risk alerts</h3>
                <p className="text-muted-foreground">All systems are operating normally</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
