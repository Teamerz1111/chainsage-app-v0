import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { ActivityFeed } from "@/components/activity-feed"
import { RiskFeed } from "@/components/risk-feed"
import { SearchPanel } from "@/components/search-panel"
import { HowItWorks } from "@/components/how-it-works"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-background matrix-bg">
      <Navbar />
      <main className="pt-16">
        <HeroSection />
        <ActivityFeed />
        <RiskFeed />
        <SearchPanel />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  )
}
