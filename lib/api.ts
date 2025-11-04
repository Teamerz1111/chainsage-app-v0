import { RiskMetadata, RiskFactors } from './risk-scoring'
import { TransactionAnalysisPrompt, WalletAnalysisPrompt } from './0g-compute'
import { apiCache } from './api-cache'

// Use HTTP for localhost, HTTPS for production
const getApiBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL
  }
  
  // Default to localhost for development
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:3001'
  }
  
  // Production fallback
  return 'https://chainsage-backend.onrender.com'
}

const API_BASE_URL = getApiBaseUrl()

export interface ApiResponse<T> {
  data?: T
  error?: string
  timestamp?: number
}

export interface TransactionData {
  hash: string
  from: string
  to: string
  value: string
  timestamp: number
  blockNumber?: number
}

export interface ClassificationResult {
  classification: {
    isUnusual: boolean
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
    confidence: number
    anomalies: string[]
    reason: string
  }
  storage: any
  timestamp: number
}

export interface WalletAnalysis {
  walletAddress: string
  analysis: {
    isUnusual: boolean
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
    confidence: number
    anomalies: string[]
    dailyVolume: string
    dailyTxCount: number
    avgAmount: string
    fallbackAnalysis?: boolean
    reason?: string
  }
  walletData?: {
    dailyTxCount: number
    dailyVolumeEth: string
    currentBalanceEth: string
    totalTransactions: number
    totalTokenTransfers: number
  }
  dataAvailability?: {
    transactionsAvailable: boolean
    aiAnalysisUsed: boolean
  }
  timestamp: number
}

export interface AlertData {
  alerts: Array<{
    transactionHash: string
    classification: any
    originalTransaction: TransactionData
    timestamp: number
  }>
  total: number
  timestamp: number
}

export interface MonitoredWallet {
  address: string
  label?: string
  threshold?: number
  status?: string
  alertCount?: number
  addedAt?: number
  lastChecked?: number
  chainId?: string
  type?: string
  riskScore?: number
}

export interface MonitoredWalletsResponse {
  wallets: MonitoredWallet[]
  total: number
}

class ApiService {
  private baseUrl: string

  constructor() {
    this.baseUrl = API_BASE_URL
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    cacheTTL?: number // Optional cache TTL in milliseconds
  ): Promise<ApiResponse<T>> {
    // Only cache GET requests
    const isGetRequest = !options.method || options.method === 'GET'
    
    // Check cache for GET requests
    if (isGetRequest && cacheTTL !== undefined) {
      const cached = apiCache.get<T>(endpoint)
      if (cached) {
        return { data: cached }
      }
    }
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      
      // Cache successful GET responses
      if (isGetRequest && cacheTTL !== undefined) {
        apiCache.set(endpoint, data, undefined, cacheTTL)
      }
      
      return { data }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  // Health check
  async healthCheck() {
    return this.makeRequest('/health')
  }

  // AI Classification endpoints using 0G Compute
  async classifyTransaction(transactionData: TransactionData) {
    try {
      // Dynamic import for 0G Compute service
      const { zgComputeService } = await import('./0g-compute')
      
      const prompt: TransactionAnalysisPrompt = {
        transactionData,
        context: {
          riskFactors: {
            transactionVolume: parseFloat(transactionData.value),
            frequencyScore: 50, // Default, could be enhanced with historical data
            contractRisk: 30,   // Default, could be enhanced with contract analysis
            networkReputation: 70, // Default
            walletAge: 60,      // Default
            behaviorPattern: 40  // Default
          }
        }
      };

      const result = await zgComputeService.analyzeTransaction(prompt);
      
      if (result.success && result.data) {
        // Parse the AI response
        let analysis;
        try {
          analysis = JSON.parse(result.data);
        } catch (parseError) {
          // If parsing fails, create a fallback analysis
          analysis = {
            isUnusual: false,
            riskLevel: 'low',
            confidence: 50,
            anomalies: [],
            reason: result.data,
            recommendations: []
          };
        }

        const classificationResult: ClassificationResult = {
          classification: {
            isUnusual: analysis.isUnusual || false,
            riskLevel: analysis.riskLevel || 'low',
            confidence: analysis.confidence || 50,
            anomalies: analysis.anomalies || [],
            reason: analysis.reason || 'Analysis completed'
          },
          storage: {
            provider: result.provider,
            model: result.model,
            timestamp: Date.now()
          },
          timestamp: Date.now()
        };

        return { data: classificationResult };
      } else {
        return { error: result.error || 'Failed to analyze transaction' };
      }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }

  async getClassificationHistory(hash: string) {
    // For now, return empty history as 0G Compute doesn't store history
    // This could be enhanced to store results in 0G storage
    return { data: { history: [], total: 0 } };
  }

  async getClassificationStats(timeframe = '24h') {
    // For now, return mock stats as 0G Compute doesn't provide stats
    // This could be enhanced to aggregate from 0G storage
    return {
      data: {
        totalClassifications: 0,
        timeframe,
        riskLevels: { low: 0, medium: 0, high: 0, critical: 0 }
      }
    };
  }

  // Wallet monitoring endpoints using 0G Compute
  async analyzeWallet(address: string) {
    try {
      // Dynamic import for 0G Compute service
      const { zgComputeService } = await import('./0g-compute')
      
      // Get wallet transaction history (mock data for now, could be enhanced with real blockchain data)
      const mockTransactionHistory = [
        {
          hash: "0x123...",
          from: address,
          to: "0x456...",
          value: "1.5",
          timestamp: Date.now() - 86400000, // 1 day ago
          blockNumber: 12345
        },
        {
          hash: "0x789...",
          from: "0x456...",
          to: address,
          value: "0.8",
          timestamp: Date.now() - 172800000, // 2 days ago
          blockNumber: 12340
        }
      ];

      const prompt: WalletAnalysisPrompt = {
        walletAddress: address,
        transactionHistory: mockTransactionHistory,
        context: {
          riskFactors: {
            transactionVolume: 50,
            frequencyScore: 60,
            contractRisk: 40,
            networkReputation: 70,
            walletAge: 80,
            behaviorPattern: 50
          }
        }
      };

      const result = await zgComputeService.analyzeWallet(prompt);
      
      if (result.success && result.data) {
        // Parse the AI response
        let analysis;
        try {
          analysis = JSON.parse(result.data);
        } catch (parseError) {
          // If parsing fails, create a fallback analysis
          analysis = {
            isUnusual: false,
            riskLevel: 'low',
            confidence: 50,
            anomalies: [],
            dailyVolume: "0",
            dailyTxCount: 0,
            avgAmount: "0",
            behaviorPattern: "Normal",
            recommendations: []
          };
        }

        const walletAnalysis: WalletAnalysis = {
          walletAddress: address,
          analysis: {
            isUnusual: analysis.isUnusual || false,
            riskLevel: analysis.riskLevel || 'low',
            confidence: analysis.confidence || 50,
            anomalies: analysis.anomalies || [],
            dailyVolume: analysis.dailyVolume || "0",
            dailyTxCount: analysis.dailyTxCount || 0,
            avgAmount: analysis.avgAmount || "0",
            fallbackAnalysis: analysis.fallbackAnalysis || false,
            reason: analysis.reason
          },
          walletData: {
            dailyTxCount: analysis.dailyTxCount || 0,
            dailyVolumeEth: analysis.dailyVolume || "0",
            currentBalanceEth: "0", // Could be enhanced with real balance data
            totalTransactions: mockTransactionHistory.length,
            totalTokenTransfers: 0 // Could be enhanced with real token transfer data
          },
          dataAvailability: {
            transactionsAvailable: mockTransactionHistory.length > 0,
            aiAnalysisUsed: true // We're using 0G Compute AI
          },
          timestamp: Date.now()
        };

        return { data: walletAnalysis };
      } else {
        return { error: result.error || 'Failed to analyze wallet' };
      }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }

  async startWalletMonitoring(address: string, threshold = 1000, type = 'wallet', chainId = '1', label?: string) {
    return this.makeRequest(`/api/wallet/monitor/${address}`, {
      method: 'POST',
      body: JSON.stringify({ threshold, type, chainId, label }),
    })
  }

  async stopWalletMonitoring(address: string) {
    return this.makeRequest(`/api/wallet/monitor/${address}`, {
      method: 'DELETE',
    })
  }

  async getMonitoringStatus() {
    return this.makeRequest('/api/wallet/status', {}, 30000) // Cache for 30 seconds
  }

  async getMonitoredWallets() {
    return this.makeRequest<MonitoredWalletsResponse>('/api/wallet/monitored', {}, 60000) // Cache for 1 minute
  }

  async getWalletEvents(limit = 50, eventType?: string, walletAddress?: string) {
    const params = new URLSearchParams({ limit: limit.toString() })
    if (eventType) params.append('eventType', eventType)
    if (walletAddress) params.append('walletAddress', walletAddress)
    return this.makeRequest(`/api/wallet/events?${params}`, {}, 15000) // Cache for 15 seconds
  }

  async syncWalletsTo0G() {
    return this.makeRequest('/api/wallet/sync-to-0g', {
      method: 'POST',
    })
  }

  // Test endpoint to generate sample activity data
  async generateTestActivity() {
    return this.makeRequest('/api/wallet/test/generate-activity', {
      method: 'POST',
    })
  }

  async getAlerts(limit = 50, severity?: string) {
    const params = new URLSearchParams({ limit: limit.toString() })
    if (severity) params.append('severity', severity)
    return this.makeRequest<AlertData>(`/api/wallet/alerts?${params}`)
  }

  // 0G Integration endpoints
  async store0GData(data: any, type = 'general') {
    return this.makeRequest('/api/0g/store', {
      method: 'POST',
      body: JSON.stringify({ data, type }),
    })
  }

  async retrieve0GData(filters: {
    type?: string
    limit?: number
    page?: number
    startTime?: number
    endTime?: number
  } = {}) {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, value.toString())
    })
    return this.makeRequest(`/api/0g/retrieve?${params}`)
  }

  async get0GNetworkInfo() {
    return this.makeRequest('/api/0g/network-info')
  }

  async check0GHealth() {
    return this.makeRequest('/api/0g/health')
  }

  // Risk Scoring & Metadata endpoints
  async calculateRiskScore(transactionData: TransactionData, factors: RiskFactors) {
    return this.makeRequest<RiskMetadata>('/api/risk/calculate', {
      method: 'POST',
      body: JSON.stringify({ transactionData, factors }),
    })
  }

  async getRiskMetadata(id: string) {
    return this.makeRequest<RiskMetadata>(`/api/risk/metadata/${id}`)
  }

  async storeRiskMetadata(metadata: RiskMetadata) {
    return this.makeRequest('/api/0g/store-risk-metadata', {
      method: 'POST',
      body: JSON.stringify({ 
        data: metadata, 
        type: 'risk_metadata',
        id: metadata.id 
      }),
    })
  }

  async retrieveRiskMetadata(filters: {
    severity?: string
    startTime?: number
    endTime?: number
    limit?: number
    page?: number
  } = {}) {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, value.toString())
    })
    return this.makeRequest<{ metadata: RiskMetadata[], total: number }>(`/api/0g/retrieve-risk-metadata?${params}`)
  }

  async getAuditTrail(riskId: string) {
    return this.makeRequest(`/api/risk/audit-trail/${riskId}`)
  }

  // Blockchain activity endpoints
  async getWalletActivity(address: string, limit = 20, type = 'all') {
    const params = new URLSearchParams({ limit: limit.toString(), type })
    return this.makeRequest(`/api/wallet/activity/${address}?${params}`)
  }

  async getActivityFeed(limit = 50, chainId?: string) {
    const params = new URLSearchParams({ limit: limit.toString() })
    if (chainId) params.append('chainId', chainId)
    return this.makeRequest(`/api/wallet/activity-feed?${params}`)
  }

  async getWalletBalance(address: string) {
    return this.makeRequest(`/api/wallet/balance/${address}`, {}, 30000) // Cache for 30 seconds
  }
}

export const apiService = new ApiService()