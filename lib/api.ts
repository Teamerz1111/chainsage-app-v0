import { RiskMetadata, RiskFactors } from './risk-scoring'

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

class ApiService {
  private baseUrl: string

  constructor() {
    this.baseUrl = API_BASE_URL
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
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

  // AI Classification endpoints
  async classifyTransaction(transactionData: TransactionData) {
    return this.makeRequest<ClassificationResult>('/api/ai/classify', {
      method: 'POST',
      body: JSON.stringify({ transactionData }),
    })
  }

  async getClassificationHistory(hash: string) {
    return this.makeRequest(`/api/ai/history/${hash}`)
  }

  async getClassificationStats(timeframe = '24h') {
    return this.makeRequest(`/api/ai/stats?timeframe=${timeframe}`)
  }

  // Wallet monitoring endpoints
  async analyzeWallet(address: string) {
    return this.makeRequest<WalletAnalysis>(`/api/wallet/analyze/${address}`, {
      method: 'POST',
    })
  }

  async startWalletMonitoring(address: string, threshold = 1000) {
    return this.makeRequest(`/api/wallet/monitor/${address}`, {
      method: 'POST',
      body: JSON.stringify({ threshold }),
    })
  }

  async stopWalletMonitoring(address: string) {
    return this.makeRequest(`/api/wallet/monitor/${address}`, {
      method: 'DELETE',
    })
  }

  async getMonitoringStatus() {
    return this.makeRequest('/api/wallet/status')
  }

  async getMonitoredWallets() {
    return this.makeRequest('/api/wallet/monitored')
  }

  async getWalletEvents(limit = 50, eventType?: string, walletAddress?: string) {
    const params = new URLSearchParams({ limit: limit.toString() })
    if (eventType) params.append('eventType', eventType)
    if (walletAddress) params.append('walletAddress', walletAddress)
    return this.makeRequest(`/api/wallet/events?${params}`)
  }

  async syncWalletsTo0G() {
    return this.makeRequest('/api/wallet/sync-to-0g', {
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
}

export const apiService = new ApiService()