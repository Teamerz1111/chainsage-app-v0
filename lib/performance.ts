/**
 * Performance monitoring and Web Vitals tracking
 */

export interface PerformanceMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  timestamp: number
}

/**
 * Track Web Vitals metrics (CLS, FID, FCP, LCP, TTFB)
 */
export function trackWebVitals() {
  if (typeof window === 'undefined') return

  // Use web-vitals library if available
  import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
    onCLS(sendToAnalytics)
    onFID(sendToAnalytics)
    onFCP(sendToAnalytics)
    onLCP(sendToAnalytics)
    onTTFB(sendToAnalytics)
  }).catch(() => {
    console.warn('web-vitals library not available')
  })
}

/**
 * Send metrics to analytics service
 */
function sendToAnalytics(metric: any) {
  const body = {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    timestamp: Date.now()
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Web Vital:', body)
  }

  // Send to analytics endpoint (can be customized)
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics', JSON.stringify(body))
  }
}

/**
 * Measure component render time
 */
export function measureRenderTime(componentName: string, callback: () => void) {
  const startTime = performance.now()
  callback()
  const endTime = performance.now()
  const duration = endTime - startTime

  if (duration > 16) { // Alert if render takes more than one frame (16ms)
    console.warn(`${componentName} render took ${duration.toFixed(2)}ms`)
  }

  return duration
}

/**
 * Track page load performance
 */
export function trackPageLoad() {
  if (typeof window === 'undefined') return

  window.addEventListener('load', () => {
    const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    
    if (!perfData) return

    const metrics = {
      dns: perfData.domainLookupEnd - perfData.domainLookupStart,
      tcp: perfData.connectEnd - perfData.connectStart,
      ttfb: perfData.responseStart - perfData.requestStart,
      download: perfData.responseEnd - perfData.responseStart,
      domInteractive: perfData.domInteractive - perfData.fetchStart,
      domComplete: perfData.domComplete - perfData.fetchStart,
      loadComplete: perfData.loadEventEnd - perfData.fetchStart
    }

    console.log('Page Load Metrics:', metrics)
  })
}

/**
 * Monitor long tasks (> 50ms)
 */
export function monitorLongTasks() {
  if (typeof window === 'undefined') return
  if (!('PerformanceObserver' in window)) return

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.warn('Long task detected:', {
          duration: entry.duration,
          startTime: entry.startTime
        })
      }
    })

    observer.observe({ entryTypes: ['longtask'] })
  } catch (e) {
    console.warn('Long task monitoring not supported')
  }
}

/**
 * Memory usage monitoring
 */
export function monitorMemoryUsage() {
  if (typeof window === 'undefined') return
  if (!('memory' in performance)) return

  const memory = (performance as any).memory
  
  return {
    usedJSHeapSize: (memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
    totalJSHeapSize: (memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
    jsHeapSizeLimit: (memory.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB'
  }
}

/**
 * Resource timing tracking
 */
export function trackResourceTiming() {
  if (typeof window === 'undefined') return

  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
  
  const summary = resources.reduce((acc, resource) => {
    const type = resource.initiatorType
    if (!acc[type]) {
      acc[type] = { count: 0, totalDuration: 0 }
    }
    acc[type].count++
    acc[type].totalDuration += resource.duration
    return acc
  }, {} as Record<string, { count: number; totalDuration: number }>)

  return summary
}

/**
 * Initialize all performance monitoring
 */
export function initPerformanceMonitoring() {
  if (typeof window === 'undefined') return

  trackWebVitals()
  trackPageLoad()
  monitorLongTasks()

  // Log memory usage periodically in development
  if (process.env.NODE_ENV === 'development') {
    setInterval(() => {
      const memory = monitorMemoryUsage()
      if (memory) {
        console.log('Memory Usage:', memory)
      }
    }, 30000) // Every 30 seconds
  }
}
