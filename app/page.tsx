import dynamic from 'next/dynamic'
import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { Footer } from "@/components/footer"
import { WalletConnectBanner } from "@/components/wallet-connect-banner"

// Lazy load heavy components for better initial page load
const ActivityFeed = dynamic(() => import('@/components/activity-feed').then(mod => ({ default: mod.ActivityFeed })), {
  loading: () => <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
})

const RiskFeed = dynamic(() => import('@/components/risk-feed').then(mod => ({ default: mod.RiskFeed })), {
  loading: () => <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
})

const SearchPanel = dynamic(() => import('@/components/search-panel').then(mod => ({ default: mod.SearchPanel })), {
  loading: () => <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
})

const HowItWorks = dynamic(() => import('@/components/how-it-works').then(mod => ({ default: mod.HowItWorks })), {
  loading: () => <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
})

export default function Home() {
  return (
    <div className="min-h-screen bg-background matrix-bg">
      <Navbar />
      <main className="pt-16">
        <HeroSection />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <WalletConnectBanner />
        </div>
        <ActivityFeed />
        <RiskFeed />
        <SearchPanel />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  )
}
