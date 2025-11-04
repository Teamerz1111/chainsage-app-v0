/**
 * Image optimization and lazy loading utilities
 */

/**
 * Preload critical images
 */
export function preloadImages(urls: string[]) {
  if (typeof window === 'undefined') return

  urls.forEach(url => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = url
    document.head.appendChild(link)
  })
}

/**
 * Lazy load image with IntersectionObserver
 */
export function lazyLoadImage(
  img: HTMLImageElement,
  src: string,
  options: IntersectionObserverInit = {}
) {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    img.src = src
    return
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target as HTMLImageElement
        target.src = src
        observer.unobserve(target)
      }
    })
  }, {
    rootMargin: '50px',
    ...options
  })

  observer.observe(img)
}

/**
 * Preload critical resources for faster page loads
 */
export function preloadCriticalResources() {
  if (typeof window === 'undefined') return

  // Preload fonts
  const fonts = [
    '/fonts/inter.woff2',
    '/fonts/space-grotesk.woff2'
  ]

  fonts.forEach(font => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'font'
    link.type = 'font/woff2'
    link.crossOrigin = 'anonymous'
    link.href = font
    document.head.appendChild(link)
  })

  // Prefetch important pages
  const pages = ['/admin', '/chat']
  
  pages.forEach(page => {
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = page
    document.head.appendChild(link)
  })
}

/**
 * Generate responsive image srcset
 */
export function generateSrcSet(baseUrl: string, sizes: number[]): string {
  return sizes
    .map(size => `${baseUrl}?w=${size} ${size}w`)
    .join(', ')
}

/**
 * Optimize background image loading
 */
export function loadBackgroundImage(
  element: HTMLElement,
  imageUrl: string,
  options: IntersectionObserverInit = {}
) {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    element.style.backgroundImage = `url(${imageUrl})`
    return
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target as HTMLElement
        target.style.backgroundImage = `url(${imageUrl})`
        target.classList.add('loaded')
        observer.unobserve(target)
      }
    })
  }, {
    rootMargin: '100px',
    ...options
  })

  observer.observe(element)
}
