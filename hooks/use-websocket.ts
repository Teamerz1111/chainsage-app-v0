/**
 * Reusable hook for WebSocket subscriptions
 */

import { useEffect, useRef } from 'react'
import { wsService, WebSocketMessage, WebSocketCallback } from '@/lib/websocket'

/**
 * Hook for subscribing to WebSocket messages
 */
export function useWebSocket(
  messageType: string,
  callback: WebSocketCallback,
  deps: any[] = []
) {
  const callbackRef = useRef(callback)

  // Update callback ref when it changes
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    // Ensure WebSocket is connected
    if (!wsService.isConnected()) {
      wsService.connect()
    }

    // Subscribe with stable callback reference
    const unsubscribe = wsService.subscribe(messageType, (message) => {
      callbackRef.current(message)
    })

    return () => {
      unsubscribe()
    }
  }, [messageType, ...deps])
}

/**
 * Hook for real-time activity updates
 */
export function useActivityUpdates(onUpdate: (data: any) => void) {
  useWebSocket('blockchain_activity', (message) => {
    if (message.data) {
      onUpdate(message.data)
    }
  })
}

/**
 * Hook for real-time alert updates
 */
export function useAlertUpdates(onAlert: (alert: any) => void) {
  useWebSocket('alert', (message) => {
    if (message.data) {
      onAlert(message.data)
    }
  })
}

/**
 * Hook for wallet event updates
 */
export function useWalletEventUpdates(onEvent: (event: any) => void) {
  useWebSocket('wallet_event', (message) => {
    if (message.data) {
      onEvent(message.data)
    }
  })
}
