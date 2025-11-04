/**
 * Reusable hooks for API data fetching with caching and error handling
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { apiService, ApiResponse } from '@/lib/api'

interface UseApiOptions {
  skip?: boolean
  refetchInterval?: number
  onSuccess?: (data: any) => void
  onError?: (error: string) => void
}

/**
 * Generic hook for API requests with loading and error states
 */
export function useApi<T>(
  fetcher: () => Promise<ApiResponse<T>>,
  options: UseApiOptions = {}
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isMountedRef = useRef(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchData = useCallback(async () => {
    if (options.skip) return

    try {
      setLoading(true)
      setError(null)
      const response = await fetcher()
      
      if (isMountedRef.current) {
        if (response.error) {
          setError(response.error)
          options.onError?.(response.error)
        } else if (response.data) {
          setData(response.data)
          options.onSuccess?.(response.data)
        }
      }
    } catch (err) {
      if (isMountedRef.current) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        options.onError?.(errorMessage)
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [fetcher, options.skip])

  useEffect(() => {
    isMountedRef.current = true
    fetchData()

    // Set up refetch interval if specified
    if (options.refetchInterval) {
      intervalRef.current = setInterval(fetchData, options.refetchInterval)
    }

    return () => {
      isMountedRef.current = false
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [fetchData, options.refetchInterval])

  const refetch = useCallback(() => {
    return fetchData()
  }, [fetchData])

  return { data, loading, error, refetch }
}

/**
 * Hook for monitoring status with auto-refresh
 */
export function useMonitoringStatus(refreshInterval = 30000) {
  return useApi(
    () => apiService.getMonitoringStatus(),
    { refetchInterval: refreshInterval }
  )
}

/**
 * Hook for wallet events with filtering
 */
export function useWalletEvents(
  limit = 50,
  eventType?: string,
  walletAddress?: string,
  refreshInterval = 15000
) {
  return useApi(
    () => apiService.getWalletEvents(limit, eventType, walletAddress),
    { refetchInterval: refreshInterval }
  )
}

/**
 * Hook for activity feed with auto-refresh
 */
export function useActivityFeed(limit = 50, chainId?: string, refreshInterval = 20000) {
  return useApi(
    () => apiService.getActivityFeed(limit, chainId),
    { refetchInterval: refreshInterval }
  )
}

/**
 * Hook for wallet balance with caching
 */
export function useWalletBalance(address: string | null, skip = false) {
  return useApi(
    () => apiService.getWalletBalance(address!),
    { skip: !address || skip }
  )
}

/**
 * Hook for monitored wallets
 */
export function useMonitoredWallets(refreshInterval = 60000) {
  return useApi(
    () => apiService.getMonitoredWallets(),
    { refetchInterval: refreshInterval }
  )
}
