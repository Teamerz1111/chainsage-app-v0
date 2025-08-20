"use client"

import type React from "react"

import { useWallet } from "@/contexts/wallet-context"
import { Wallet, Shield, AlertTriangle } from "lucide-react"
import { WalletButton } from "@/components/wallet-button"

interface ProtectedRouteProps {
  children: React.ReactNode
  title?: string
  description?: string
}

export function ProtectedRoute({
  children,
  title = "Admin Access",
  description = "Connect your wallet to access this area",
}: ProtectedRouteProps) {
  const { isConnected, isConnecting } = useWallet()

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyber-dark via-gray-900 to-black flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto w-24 h-24 bg-cyber-cyan/10 rounded-full flex items-center justify-center mb-6">
              <Shield className="w-12 h-12 text-cyber-cyan" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
            <p className="text-gray-400 mb-8">{description}</p>
          </div>

          <div className="bg-cyber-dark/50 border border-cyber-cyan/20 rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-3 text-cyber-cyan">
              <Wallet className="w-5 h-5" />
              <span className="font-medium">Wallet Connection Required</span>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-cyber-green rounded-full mt-2 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium">Secure Access</p>
                  <p className="text-gray-400 text-sm">Your wallet serves as your secure login credential</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-cyber-green rounded-full mt-2 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium">Personal Dashboard</p>
                  <p className="text-gray-400 text-sm">Manage your watchlists and preferences</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-cyber-green rounded-full mt-2 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium">Real-time Alerts</p>
                  <p className="text-gray-400 text-sm">Get personalized notifications for your tracked addresses</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-cyber-cyan/10">
              <div className="flex justify-center">
                <WalletButton />
              </div>
            </div>

            <div className="flex items-center gap-2 text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-lg p-3">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <p className="text-sm">Make sure you have MetaMask or a compatible wallet installed</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
