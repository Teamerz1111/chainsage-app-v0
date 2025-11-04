"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Wallet, Shield, Zap } from "lucide-react"
import { zgComputeService } from "@/lib/0g-compute"

export function WalletConnectBanner() {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)

  useEffect(() => {
    checkWalletConnection()
  }, [])

  const checkWalletConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        if (accounts.length > 0) {
          setIsConnected(true)
          setWalletAddress(accounts[0])
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error)
      }
    }
  }

  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      alert('Please install MetaMask to use AI-powered analysis!')
      return
    }

    try {
      setIsConnecting(true)
      
      // Request wallet connection
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      })
      
      if (accounts.length > 0) {
        setWalletAddress(accounts[0])
        setIsConnected(true)
        
        // Initialize 0G Compute
        console.log('Initializing 0G Compute...')
        const initialized = await zgComputeService.initialize()
        
        if (initialized) {
          console.log('✅ 0G Compute initialized successfully!')
        } else {
          console.warn('⚠️ 0G Compute initialization failed, but wallet is connected')
        }
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      alert('Failed to connect wallet. Please try again.')
    } finally {
      setIsConnecting(false)
    }
  }

  if (isConnected && walletAddress) {
    return (
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">AI Analysis Active</p>
              <p className="text-xs text-muted-foreground">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-primary">
            <Zap className="h-4 w-4" />
            <span>Powered by 0G Compute</span>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20 p-6 mb-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-500/20 rounded-lg">
            <Wallet className="h-6 w-6 text-amber-500" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Connect Wallet for AI Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Unlock AI-powered transaction risk detection with 0G Compute
            </p>
          </div>
        </div>
        <Button 
          onClick={connectWallet}
          disabled={isConnecting}
          size="lg"
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
        >
          {isConnecting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Connecting...
            </>
          ) : (
            <>
              <Wallet className="h-4 w-4 mr-2" />
              Connect Wallet
            </>
          )}
        </Button>
      </div>
    </Card>
  )
}
