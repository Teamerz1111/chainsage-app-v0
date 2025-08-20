"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { WalletButton } from "@/components/wallet-button"
import { useWallet } from "@/contexts/wallet-context"
import { Search, Activity, AlertTriangle, HelpCircle, Settings } from "lucide-react"
import Link from "next/link"

const navItems = [
  { id: "hero", label: "Home", icon: null },
  { id: "activity", label: "Activity", icon: Activity },
  { id: "risk", label: "Risk", icon: AlertTriangle },
  { id: "search", label: "Search", icon: Search },
  { id: "how-it-works", label: "How It Works", icon: HelpCircle },
]

export function Navbar() {
  const [activeSection, setActiveSection] = useState("hero")
  const { isConnected } = useWallet()

  useEffect(() => {
    const handleScroll = () => {
      const sections = navItems.map((item) => document.getElementById(item.id))
      const scrollPosition = window.scrollY + 100

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i]
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(navItems[i].id)
          break
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-bold font-serif text-primary neon-text">🔗 ChainSage</div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => scrollToSection(item.id)}
                  className={`flex items-center space-x-2 transition-all duration-200 ${
                    activeSection === item.id
                      ? "text-primary bg-primary/10 neon-glow"
                      : "text-muted-foreground hover:text-primary hover:bg-accent/20"
                  }`}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  <span>{item.label}</span>
                </Button>
              )
            })}

            {isConnected && (
              <Link href="/admin">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 transition-all duration-200 text-cyber-cyan hover:text-cyber-cyan hover:bg-cyber-cyan/10 border border-transparent hover:border-cyber-cyan/30"
                >
                  <Settings className="h-4 w-4" />
                  <span>Admin</span>
                </Button>
              </Link>
            )}
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:block">
              <Input
                type="text"
                placeholder="Quick search..."
                className="w-48 bg-input border-border focus:border-primary focus:ring-primary/20"
              />
            </div>
            <ThemeToggle />
            <WalletButton />
          </div>
        </div>
      </div>
    </nav>
  )
}
