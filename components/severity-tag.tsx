"use client"

import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AlertTriangle, Shield, Eye, TrendingDown, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { IntelligentRiskScorer } from "@/lib/risk-scoring"

interface SeverityTagProps {
  severity: 'low' | 'medium' | 'high' | 'critical'
  score: number
  confidence: number
  showDetails?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const severityIcons = {
  critical: AlertTriangle,
  high: TrendingDown,
  medium: Eye,
  low: Shield,
}

export function SeverityTag({ 
  severity, 
  score, 
  confidence, 
  showDetails = true, 
  size = 'md',
  className 
}: SeverityTagProps) {
  const config = IntelligentRiskScorer.getSeverityColor(severity)
  const SeverityIcon = severityIcons[severity]
  
  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5", 
    lg: "text-base px-4 py-2"
  }

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  }

  const content = (
    <Badge 
      className={cn(
        "font-semibold border transition-all duration-200 hover:scale-105",
        config.color,
        config.bgColor,
        config.borderColor,
        sizeClasses[size],
        className
      )}
    >
      <SeverityIcon className={cn(iconSizes[size], "mr-1.5")} />
      <span className="capitalize">{severity}</span>
      {showDetails && (
        <>
          <span className="mx-1.5">•</span>
          <span className="font-mono">{score.toFixed(0)}</span>
        </>
      )}
    </Badge>
  )

  if (!showDetails) {
    return content
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {content}
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="max-w-xs p-3"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-400" />
              <span className="font-semibold">Risk Analysis</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Score:</span>
                <span className="ml-1 font-mono">{score.toFixed(1)}/100</span>
              </div>
              <div>
                <span className="text-muted-foreground">Confidence:</span>
                <span className="ml-1 font-mono">{confidence.toFixed(0)}%</span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Calculated using intelligent risk scoring algorithm
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}