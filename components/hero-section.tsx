"use client"

import React, { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, Zap } from "lucide-react"
import Link from "next/link"

export const HeroSection = React.memo(function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Network nodes animation
    const nodes: Array<{ x: number; y: number; vx: number; vy: number; connections: number[] }> = []
    const nodeCount = 50

    // Initialize nodes
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        connections: [],
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update and draw nodes
      nodes.forEach((node, i) => {
        // Update position
        node.x += node.vx
        node.y += node.vy

        // Bounce off edges
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1

        // Keep nodes in bounds
        node.x = Math.max(0, Math.min(canvas.width, node.x))
        node.y = Math.max(0, Math.min(canvas.height, node.y))

        // Draw connections
        nodes.forEach((otherNode, j) => {
          if (i !== j) {
            const distance = Math.sqrt(Math.pow(node.x - otherNode.x, 2) + Math.pow(node.y - otherNode.y, 2))
            if (distance < 150) {
              const opacity = (150 - distance) / 150
              ctx.strokeStyle = `rgba(0, 255, 179, ${opacity * 0.3})`
              ctx.lineWidth = 1
              ctx.beginPath()
              ctx.moveTo(node.x, node.y)
              ctx.lineTo(otherNode.x, otherNode.y)
              ctx.stroke()
            }
          }
        })

        // Draw node
        ctx.fillStyle = "rgba(0, 255, 179, 0.8)"
        ctx.beginPath()
        ctx.arc(node.x, node.y, 2, 0, Math.PI * 2)
        ctx.fill()
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-30"
        style={{ background: "transparent" }}
      />

      {/* Matrix-style falling code effect */}
      <div className="absolute inset-0 opacity-10">
        <div className="matrix-rain">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="matrix-column"
              style={{
                left: `${i * 5}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            >
              {Array.from({ length: 20 }).map((_, j) => (
                <span
                  key={j}
                  className="matrix-char text-primary font-mono text-sm"
                  style={{
                    animationDelay: `${j * 0.1}s`,
                  }}
                >
                  {String.fromCharCode(0x30a0 + Math.random() * 96)}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Floating geometric shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-primary/20 rotate-45 animate-spin-slow"></div>
        <div className="absolute top-3/4 left-1/6 w-24 h-24 border border-secondary/20 animate-bounce-slow"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Main Headline */}
        <div className="mb-8">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold font-serif mb-6 leading-tight">
            <span className="text-primary neon-text animate-pulse">Real-Time</span>
            <br />
            <span className="text-foreground">On-Chain</span>
            <br />
            <span className="text-secondary neon-text animate-pulse delay-500">Intelligence</span>
          </h1>
          <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in-up">
            Monitor blockchain activity with advanced risk detection, real-time transaction feeds, and comprehensive
            watchlist management.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="flex flex-wrap justify-center gap-6 mb-12 animate-fade-in-up delay-300">
          <div className="flex items-center space-x-2 text-primary hover:neon-glow transition-all duration-300 cursor-default">
            <Zap className="h-5 w-5 animate-pulse" />
            <span className="font-medium">Real-Time Monitoring</span>
          </div>
          <div className="flex items-center space-x-2 text-secondary hover:neon-glow transition-all duration-300 cursor-default">
            <Shield className="h-5 w-5 animate-pulse delay-200" />
            <span className="font-medium">Risk Detection</span>
          </div>
          <div className="flex items-center space-x-2 text-primary hover:neon-glow transition-all duration-300 cursor-default">
            <ArrowRight className="h-5 w-5 animate-pulse delay-400" />
            <span className="font-medium">Multi-Chain Support</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-500">
          <Link href="/admin">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 neon-glow font-semibold px-8 py-3 text-lg transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-primary/25"
            >
              Open Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Button
            size="lg"
            variant="outline"
            onClick={() => scrollToSection("watchlist")}
            className="border-secondary text-secondary hover:bg-secondary/10 hover:border-secondary/80 font-semibold px-8 py-3 text-lg transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-secondary/25"
          >
            Add to Watchlist
          </Button>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-primary rounded-full flex justify-center neon-glow">
            <div className="w-1 h-3 bg-primary rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  )
})
