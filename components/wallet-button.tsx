"use client"

import { useWallet } from "@/contexts/wallet-context"
import { Button } from "@/components/ui/button"
import { Wallet, LogOut, AlertCircle } from "lucide-react"
import { useState } from "react"

export function WalletButton() {
  const { isConnected, address, isConnecting, connect, disconnect, error } = useWallet()
  const [showError, setShowError] = useState(false)

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const handleConnect = async () => {
    await connect()
    if (error) {
      setShowError(true)
      setTimeout(() => setShowError(false), 5000)
    }
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-2 bg-cyber-dark/50 border border-cyber-cyan/20 rounded-lg">
          <div className="w-2 h-2 bg-cyber-green rounded-full animate-pulse" />
          <span className="text-sm font-mono text-cyber-cyan">{formatAddress(address)}</span>
        </div>
        <Button
          onClick={disconnect}
          variant="outline"
          size="sm"
          className="border-cyber-red/30 text-cyber-red hover:bg-cyber-red/10 bg-transparent"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        onClick={handleConnect}
        disabled={isConnecting}
        className="bg-cyber-cyan/20 border border-cyber-cyan/30 text-cyber-cyan hover:bg-cyber-cyan/30 transition-all duration-200"
      >
        <Wallet className="w-4 h-4 mr-2" />
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </Button>

      {showError && error && (
        <div className="flex items-center gap-2 px-3 py-2 bg-cyber-red/10 border border-cyber-red/30 rounded-lg text-sm text-cyber-red">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
