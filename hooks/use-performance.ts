/**
 * React hooks for performance monitoring
 */

import { useEffect, useRef } from 'react'

/**
 * Hook to measure component mount/update time
 */
export function usePerformanceMonitor(componentName: string) {
  const renderCount = useRef(0)
  const mountTime = useRef<number>(0)

  useEffect(() => {
    if (renderCount.current === 0) {
      mountTime.current = performance.now()
    }
    renderCount.current++
  })

  useEffect(() => {
    return () => {
      if (mountTime.current > 0) {
        const lifetime = performance.now() - mountTime.current
        console.log(`${componentName} lifetime: ${lifetime.toFixed(2)}ms, renders: ${renderCount.current}`)
      }
    }
  }, [componentName])
}

/**
 * Hook to detect slow renders
 */
export function useRenderTime(componentName: string, threshold = 16) {
  const renderStartTime = useRef<number>(0)

  renderStartTime.current = performance.now()

  useEffect(() => {
    const renderTime = performance.now() - renderStartTime.current
    if (renderTime > threshold) {
      console.warn(`${componentName} slow render: ${renderTime.toFixed(2)}ms`)
    }
  })
}

/**
 * Hook to track user interactions
 */
export function useInteractionTracking(elementName: string) {
  const startTime = useRef<number>(0)

  const trackInteractionStart = () => {
    startTime.current = performance.now()
  }

  const trackInteractionEnd = (action: string) => {
    const duration = performance.now() - startTime.current
    console.log(`${elementName} ${action}: ${duration.toFixed(2)}ms`)
  }

  return { trackInteractionStart, trackInteractionEnd }
}
