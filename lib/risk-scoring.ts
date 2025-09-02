export interface RiskFactors {
  transactionVolume: number
  frequencyScore: number
  contractRisk: number
  networkReputation: number
  walletAge: number
  behaviorPattern: number
}

export interface RiskMetadata {
  id: string
  timestamp: number
  riskScore: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  confidence: number
  factors: RiskFactors
  reasoning: string[]
  auditTrail: {
    calculatedAt: number
    version: string
    model: string
  }
}

export class IntelligentRiskScorer {
  private static readonly WEIGHTS = {
    transactionVolume: 0.25,
    frequencyScore: 0.20,
    contractRisk: 0.20,
    networkReputation: 0.15,
    walletAge: 0.10,
    behaviorPattern: 0.10,
  }

  static calculateRiskScore(factors: RiskFactors): {
    score: number
    severity: 'low' | 'medium' | 'high' | 'critical'
    confidence: number
  } {
    const weightedScore = Object.entries(this.WEIGHTS).reduce((total, [factor, weight]) => {
      return total + (factors[factor as keyof RiskFactors] * weight)
    }, 0)

    const normalizedScore = Math.max(0, Math.min(100, weightedScore))
    
    let severity: 'low' | 'medium' | 'high' | 'critical'
    if (normalizedScore >= 80) severity = 'critical'
    else if (normalizedScore >= 60) severity = 'high'
    else if (normalizedScore >= 30) severity = 'medium'
    else severity = 'low'

    const confidence = this.calculateConfidence(factors)

    return { score: normalizedScore, severity, confidence }
  }

  private static calculateConfidence(factors: RiskFactors): number {
    const factorVariance = Object.values(factors).reduce((sum, value, _, arr) => {
      const mean = arr.reduce((a, b) => a + b, 0) / arr.length
      return sum + Math.pow(value - mean, 2)
    }, 0) / Object.values(factors).length

    const baseConfidence = 85
    const variancePenalty = Math.min(30, factorVariance * 0.5)
    
    return Math.max(50, Math.min(100, baseConfidence - variancePenalty))
  }

  static generateRiskMetadata(
    id: string,
    factors: RiskFactors,
    reasoning: string[] = []
  ): RiskMetadata {
    const { score, severity, confidence } = this.calculateRiskScore(factors)
    
    return {
      id,
      timestamp: Date.now(),
      riskScore: score,
      severity,
      confidence,
      factors,
      reasoning,
      auditTrail: {
        calculatedAt: Date.now(),
        version: '1.0.0',
        model: 'intelligent-risk-scorer-v1'
      }
    }
  }

  static getSeverityColor(severity: 'low' | 'medium' | 'high' | 'critical'): {
    color: string
    bgColor: string
    borderColor: string
    ringColor: string
  } {
    const severityColors = {
      critical: {
        color: "text-red-400",
        bgColor: "bg-red-500/10",
        borderColor: "border-red-500/30",
        ringColor: "ring-red-500/50",
      },
      high: {
        color: "text-orange-400",
        bgColor: "bg-orange-500/10",
        borderColor: "border-orange-500/30",
        ringColor: "ring-orange-500/50",
      },
      medium: {
        color: "text-yellow-400",
        bgColor: "bg-yellow-500/10",
        borderColor: "border-yellow-500/30",
        ringColor: "ring-yellow-500/50",
      },
      low: {
        color: "text-blue-400",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/30",
        ringColor: "ring-blue-500/50",
      },
    }

    return severityColors[severity]
  }
}