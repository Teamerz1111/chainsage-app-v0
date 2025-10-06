import { TransactionAnalysisPrompt } from './0g-compute'

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
    provider?: string
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

  static async generateRiskMetadataWithAI(
    id: string,
    factors: RiskFactors,
    transactionData?: {
      hash: string
      from: string
      to: string
      value: string
      timestamp: number
      blockNumber?: number
    }
  ): Promise<RiskMetadata> {
    const { score, severity, confidence } = this.calculateRiskScore(factors)
    
    let aiReasoning: string[] = []
    let aiProvider: string | undefined

    // Use 0G Compute for enhanced reasoning if transaction data is available
    if (transactionData) {
      try {
        // Dynamic import for 0G Compute service
        const { zgComputeService } = await import('./0g-compute')
        
        const prompt: TransactionAnalysisPrompt = {
          transactionData,
          context: {
            riskFactors: factors
          }
        };

        const result = await zgComputeService.analyzeTransaction(prompt);
        
        if (result.success && result.data) {
          try {
            const analysis = JSON.parse(result.data);
            aiReasoning = analysis.recommendations || [];
            aiProvider = result.provider;
          } catch (parseError) {
            // If parsing fails, use the raw response as reasoning
            aiReasoning = [result.data];
            aiProvider = result.provider;
          }
        }
      } catch (error) {
        console.warn("Failed to get AI reasoning:", error);
        // Continue with fallback reasoning
      }
    }

    // Fallback reasoning if AI analysis fails
    if (aiReasoning.length === 0) {
      aiReasoning = this.generateFallbackReasoning(factors, severity)
    }
    
    return {
      id,
      timestamp: Date.now(),
      riskScore: score,
      severity,
      confidence,
      factors,
      reasoning: aiReasoning,
      auditTrail: {
        calculatedAt: Date.now(),
        version: '2.0.0',
        model: aiProvider ? `0g-compute-${aiProvider}` : 'intelligent-risk-scorer-v2',
        provider: aiProvider
      }
    }
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

  private static generateFallbackReasoning(factors: RiskFactors, severity: string): string[] {
    const reasoning: string[] = []

    if (factors.transactionVolume > 80) {
      reasoning.push("High transaction volume detected")
    }
    if (factors.frequencyScore > 70) {
      reasoning.push("Unusual transaction frequency pattern")
    }
    if (factors.contractRisk > 60) {
      reasoning.push("High-risk contract interaction")
    }
    if (factors.networkReputation < 40) {
      reasoning.push("Low network reputation score")
    }
    if (factors.walletAge < 30) {
      reasoning.push("Recently created wallet")
    }
    if (factors.behaviorPattern > 70) {
      reasoning.push("Suspicious behavioral pattern detected")
    }

    if (reasoning.length === 0) {
      reasoning.push(`Risk level: ${severity} based on standard analysis`)
    }

    return reasoning
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