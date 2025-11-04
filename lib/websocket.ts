const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'wss://chainsage-backend.onrender.com'

export interface WebSocketMessage {
  type: string
  data: any
  timestamp: number
}

export type WebSocketCallback = (message: WebSocketMessage) => void

class WebSocketService {
  private ws: WebSocket | null = null
  private callbacks: Map<string, WebSocketCallback[]> = new Map()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private reconnectTimeout: NodeJS.Timeout | null = null
  private heartbeatInterval: NodeJS.Timeout | null = null
  private heartbeatTimeout: NodeJS.Timeout | null = null
  private isIntentionalDisconnect = false
  private messageQueue: any[] = [] // Queue for messages sent while disconnected

  connect() {
    if (typeof window === 'undefined') return // SSR check

    try {
      this.ws = new WebSocket(WS_URL)

      this.ws.onopen = () => {
        console.log('WebSocket connected')
        this.reconnectAttempts = 0
        this.startHeartbeat()
        this.flushMessageQueue()
      }

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          this.handleMessage(message)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }

      this.ws.onclose = () => {
        console.log('WebSocket disconnected')
        this.stopHeartbeat()
        if (!this.isIntentionalDisconnect) {
          this.attemptReconnect()
        }
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
      }
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error)
      this.attemptReconnect()
    }
  }

  private handleMessage(message: WebSocketMessage) {
    const typeCallbacks = this.callbacks.get(message.type) || []
    const allCallbacks = this.callbacks.get('*') || []

    const allCallbacksToRun = typeCallbacks.concat(allCallbacks)
    
    allCallbacksToRun.forEach(callback => {
      try {
        callback(message)
      } catch (error) {
        console.error('Error in WebSocket callback:', error)
      }
    })
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      return
    }

    // Clear any existing reconnect timeout
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
    }

    this.reconnectAttempts++
    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      30000 // Max 30 seconds
    )

    this.reconnectTimeout = setTimeout(() => {
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
      this.connect()
    }, delay)
  }

  private startHeartbeat() {
    this.stopHeartbeat()
    
    // Send ping every 30 seconds
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping', timestamp: Date.now() })
        
        // Expect pong within 5 seconds
        this.heartbeatTimeout = setTimeout(() => {
          console.warn('Heartbeat timeout - reconnecting')
          this.ws?.close()
        }, 5000)
      }
    }, 30000)
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout)
      this.heartbeatTimeout = null
    }
  }

  private flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()
      this.send(message)
    }
  }

  subscribe(messageType: string, callback: WebSocketCallback): () => void {
    if (!this.callbacks.has(messageType)) {
      this.callbacks.set(messageType, [])
    }
    
    this.callbacks.get(messageType)!.push(callback)

    // Return unsubscribe function
    return () => {
      const callbacks = this.callbacks.get(messageType)
      if (callbacks) {
        const index = callbacks.indexOf(callback)
        if (index > -1) {
          callbacks.splice(index, 1)
        }
      }
    }
  }

  send(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      // Queue message for later if not connected
      this.messageQueue.push(message)
      if (this.messageQueue.length > 100) {
        this.messageQueue.shift() // Prevent memory leak
      }
    }
  }

  disconnect() {
    this.isIntentionalDisconnect = true
    this.stopHeartbeat()
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }
    
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.callbacks.clear()
    this.reconnectAttempts = 0
    this.messageQueue = []
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }
}

export const wsService = new WebSocketService()