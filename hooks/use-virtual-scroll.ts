/**
 * Virtual scrolling hook for optimized rendering of large lists
 * Reduces DOM nodes and improves performance
 */

import { useState, useEffect, useRef, useMemo } from 'react'

interface VirtualScrollOptions {
  itemHeight: number
  containerHeight: number
  overscan?: number // Number of items to render outside viewport
}

export function useVirtualScroll<T>(
  items: T[],
  options: VirtualScrollOptions
) {
  const { itemHeight, containerHeight, overscan = 3 } = options
  const [scrollTop, setScrollTop] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const handleScroll = (e: Event) => {
    const target = e.target as HTMLDivElement
    setScrollTop(target.scrollTop)
  }

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  const virtualData = useMemo(() => {
    const totalHeight = items.length * itemHeight
    const visibleCount = Math.ceil(containerHeight / itemHeight)
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(
      items.length,
      startIndex + visibleCount + overscan * 2
    )

    const visibleItems = items.slice(startIndex, endIndex).map((item, index) => ({
      item,
      index: startIndex + index,
      offsetTop: (startIndex + index) * itemHeight
    }))

    return {
      totalHeight,
      visibleItems,
      startIndex,
      endIndex
    }
  }, [items, itemHeight, scrollTop, containerHeight, overscan])

  return {
    scrollContainerRef,
    ...virtualData
  }
}

/**
 * Windowing component for activity feeds
 */
export function useActivityVirtualScroll(activities: any[], itemHeight = 80) {
  const containerHeight = typeof window !== 'undefined' ? Math.min(window.innerHeight * 0.6, 600) : 600
  
  return useVirtualScroll(activities, {
    itemHeight,
    containerHeight,
    overscan: 5
  })
}

/**
 * Windowing for table rows
 */
export function useTableVirtualScroll<T>(rows: T[], rowHeight = 60) {
  const containerHeight = typeof window !== 'undefined' ? Math.min(window.innerHeight * 0.7, 800) : 800
  
  return useVirtualScroll(rows, {
    itemHeight: rowHeight,
    containerHeight,
    overscan: 4
  })
}
