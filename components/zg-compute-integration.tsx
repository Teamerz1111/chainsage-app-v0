"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, Loader2, Wallet, MessageCircle } from "lucide-react"
import { IntelligentRiskScorer } from "@/lib/risk-scoring"
import { useWallet } from "@/contexts/wallet-context"

export function ZGComputeIntegration() {
    const { isConnected, address, connect, isConnecting } = useWallet()
    const [isInitialized, setIsInitialized] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [balance, setBalance] = useState<string | null>(null)
    const [chatMessage, setChatMessage] = useState("")
    const [chatResponse, setChatResponse] = useState("")
    const [riskAnalysis, setRiskAnalysis] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)
    const [isClient, setIsClient] = useState(false)
    const [zgComputeService, setZgComputeService] = useState<any>(null)

    // Ensure we're on the client side
    useEffect(() => {
        setIsClient(true)
    }, [])

    // Load 0G Compute service dynamically
    useEffect(() => {
        if (isClient && !zgComputeService) {
            const loadService = async () => {
                try {
                    const module = await import("@/lib/0g-compute")
                    setZgComputeService(module.zgComputeService)
                    console.log("0G Compute service loaded successfully")
                } catch (err) {
                    console.error("Failed to load 0G Compute service:", err)
                    setError("Failed to load 0G Compute service. Please check your browser console for details.")
                }
            }
            loadService()
        }
    }, [isClient, zgComputeService])

    const initializeService = async () => {
        if (!isConnected) {
            setError("Please connect your wallet first")
            return
        }

        if (!zgComputeService) {
            setError("0G Compute service not loaded yet. Please wait a moment and try again.")
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            console.log("Initializing 0G Compute service...")
            const success = await zgComputeService.initialize()
            console.log("Initialization result:", success)

            if (success) {
                setIsInitialized(true)
                const accountBalance = await zgComputeService.getAccountBalance()
                console.log("Account balance:", accountBalance)
                // The balance is already formatted as "X.XXXX OG" from the service
                setBalance(accountBalance?.balance || "0.0000 OG")
                setError(null)
            } else {
                setError("Failed to initialize 0G Compute service. Check console for details.")
            }
        } catch (err) {
            console.error("Initialization error:", err)
            setError(err instanceof Error ? err.message : "Unknown error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    const sendChatMessage = async () => {
        if (!chatMessage.trim()) return

        if (!zgComputeService) {
            setError("0G Compute service not loaded yet")
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            console.log("Starting AI chat...");
            const result = await zgComputeService.chat({
                message: chatMessage,
                context: {
                    userRole: "user",
                    blockchainData: { connectedWallet: address }
                }
            })

            console.log("Chat result:", result);

            if (result.success) {
                setChatResponse(result.data)
            } else {
                setError(result.error || "Chat failed")

                // If 0G Compute fails, provide a fallback response
                if (result.error?.includes("All providers failed")) {
                    const fallbackResponse = `I apologize, but the 0G Compute AI service is currently unavailable. This could be due to:

1. **Network connectivity issues** - The 0G Compute network might be experiencing downtime
2. **Provider availability** - The AI providers might be temporarily offline
3. **Account funding** - You may need to fund your account with more OG tokens
4. **Service maintenance** - The 0G Compute service might be under maintenance

**What you asked:** "${testMessage}"

**Fallback response:** As a blockchain security expert, I can tell you that blockchain security involves protecting digital assets, smart contracts, and user data from various threats including:
- Smart contract vulnerabilities
- Private key management
- Phishing attacks
- MEV (Maximal Extractable Value) attacks
- Front-running and sandwich attacks

For real-time AI assistance, please try again later or check the 0G Compute network status.`

                    setChatResponse(fallbackResponse)
                    setError(null) // Clear the error since we provided a fallback
                }
            }
        } catch (err) {
            console.error("Chat error:", err);
            setError(err instanceof Error ? err.message : "Unknown error")
        } finally {
            setIsLoading(false)
        }
    }

    const analyzeTransactionRisk = async () => {
        setIsLoading(true)
        setError(null)

        try {
            const mockTransaction = {
                hash: "0xa1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456",
                from: "0x9dBa18e9b96b905919cC828C399d313EfD55D800",
                to: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
                value: "2.5",
                timestamp: Date.now(),
                blockNumber: 18950000
            }

            const mockFactors = {
                transactionVolume: 85,
                frequencyScore: 45,
                contractRisk: 70,
                networkReputation: 60,
                walletAge: 30,
                behaviorPattern: 35
            }

            const result = await IntelligentRiskScorer.generateRiskMetadataWithAI(
                "test-risk-001",
                mockFactors,
                mockTransaction
            )

            setRiskAnalysis(result)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error")
        } finally {
            setIsLoading(false)
        }
    }

    const addFunds = async (amount: string | number = "0.1") => {
        if (!zgComputeService) {
            setError("0G Compute service not loaded yet")
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            console.log(`Starting add funds process with amount: ${amount}...`);
            const success = await zgComputeService.addFunds(amount)
            console.log("Add funds result:", success);

            if (success) {
                console.log("Getting updated account balance...");
                const accountBalance = await zgComputeService.getAccountBalance()
                console.log("Updated balance:", accountBalance);
                // The balance is already formatted as "X.XXXX OG" from the service
                setBalance(accountBalance?.balance || "0.0000 OG")
                setError(null) // Clear any previous errors
            } else {
                setError("Failed to add funds. Please check: 1) MetaMask is unlocked, 2) You have ETH for gas fees, 3) You approved the transaction. Check console for details.")
            }
        } catch (err) {
            console.error("Add funds error:", err);
            setError(err instanceof Error ? err.message : "Unknown error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    const acknowledgeProviders = async () => {
        if (!zgComputeService) {
            setError("0G Compute service not loaded yet")
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            console.log("Starting provider acknowledgment process...");
            const result = await zgComputeService.acknowledgeProviders()
            console.log("Acknowledge providers result:", result);

            if (result.success) {
                console.log(`Successfully acknowledged ${result.acknowledged.length} providers`);
                setError(null) // Clear any previous errors

                // Show success message
                if (result.acknowledged.length > 0) {
                    console.log("Acknowledged providers:", result.acknowledged);
                }
                if (result.failed.length > 0) {
                    console.warn("Failed to acknowledge providers:", result.failed);
                }
            } else {
                setError("Failed to acknowledge any providers. Check console for details.")
            }
        } catch (err) {
            console.error("Acknowledge providers error:", err);
            setError(err instanceof Error ? err.message : "Unknown error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    const allocateToInference = async (amount: string | number = 0.5) => {
        if (!zgComputeService) {
            setError("0G Compute service not loaded yet")
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            console.log(`Starting allocate to inference process with amount: ${amount}...`);
            const success = await zgComputeService.allocateFundsToInference(amount)
            console.log("Allocate to inference result:", success);

            if (success) {
                console.log("Getting updated account balance...");
                const accountBalance = await zgComputeService.getAccountBalance()
                console.log("Updated balance:", accountBalance);
                setBalance(accountBalance?.balance || "0.0000 OG")
                setError(null) // Clear any previous errors
            } else {
                setError("Failed to allocate funds to inference. Check console for details.")
            }
        } catch (err) {
            console.error("Allocate to inference error:", err);
            setError(err instanceof Error ? err.message : "Unknown error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    // Don't render until client-side
    if (!isClient) {
        return (
            <div className="max-w-4xl mx-auto p-6 space-y-6">
                <Card className="bg-gradient-to-br from-cyber-dark to-gray-900 border-cyber-cyan/20">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-cyber-cyan" />
                            <span className="ml-2 text-white">Loading 0G Compute service...</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <Card className="bg-gradient-to-br from-cyber-dark to-gray-900 border-cyber-cyan/20">
                <CardHeader>
                    <CardTitle className="text-cyber-cyan flex items-center gap-2">
                        <Wallet className="w-5 h-5" />
                        0G Compute AI Integration
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Service Load Status */}
                    <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                        <div className="flex items-center gap-3">
                            {zgComputeService ? (
                                <CheckCircle className="w-5 h-5 text-green-400" />
                            ) : (
                                <AlertCircle className="w-5 h-5 text-yellow-400" />
                            )}
                            <span className="text-white">
                                Service Loaded: {zgComputeService ? "Yes" : "No"}
                            </span>
                        </div>
                    </div>

                    {/* Wallet Connection Status */}
                    <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                        <div className="flex items-center gap-3">
                            {isConnected ? (
                                <CheckCircle className="w-5 h-5 text-green-400" />
                            ) : (
                                <AlertCircle className="w-5 h-5 text-yellow-400" />
                            )}
                            <div>
                                <span className="text-white">
                                    Wallet Status: {isConnected ? "Connected" : "Not Connected"}
                                </span>
                                {isConnected && address && (
                                    <div className="text-sm text-gray-400">
                                        {address.slice(0, 6)}...{address.slice(-4)}
                                    </div>
                                )}
                            </div>
                        </div>
                        {!isConnected && (
                            <Button
                                onClick={connect}
                                disabled={isConnecting}
                                className="bg-cyber-cyan/20 text-cyber-cyan hover:bg-cyber-cyan/30"
                            >
                                {isConnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Connect Wallet"}
                            </Button>
                        )}
                    </div>

                    {/* 0G Compute Initialization Status */}
                    <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                        <div className="flex items-center gap-3">
                            {isInitialized ? (
                                <CheckCircle className="w-5 h-5 text-green-400" />
                            ) : (
                                <AlertCircle className="w-5 h-5 text-yellow-400" />
                            )}
                            <span className="text-white">
                                0G Compute Status: {isInitialized ? "Initialized" : "Not Initialized"}
                            </span>
                        </div>
                        <Button
                            onClick={initializeService}
                            disabled={isLoading || isInitialized || !isConnected || !zgComputeService}
                            className="bg-cyber-cyan/20 text-cyber-cyan hover:bg-cyber-cyan/30"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Initialize"}
                        </Button>
                    </div>

                    {/* Account Balance */}
                    {isInitialized && balance && (
                        <div className="p-4 bg-gray-800/50 rounded-lg">
                            <div className="flex items-center justify-between">
                                <span className="text-white">Account Balance:</span>
                                <Badge variant="outline" className="border-cyber-green/30 text-cyber-green">
                                    {balance} OG
                                </Badge>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                <Button
                                    onClick={() => addFunds(1)}
                                    disabled={isLoading}
                                    size="sm"
                                    className="bg-cyber-green/20 text-cyber-green hover:bg-cyber-green/30"
                                >
                                    Add 1 OG (Documentation Format)
                                </Button>
                                <Button
                                    onClick={() => addFunds(10)}
                                    disabled={isLoading}
                                    size="sm"
                                    className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                                >
                                    Add 10 OG (Documentation Format)
                                </Button>
                                <Button
                                    onClick={() => addFunds(0.1)}
                                    disabled={isLoading}
                                    size="sm"
                                    className="bg-purple-500/20 text-purple-400 hover:bg-purple-500/30"
                                >
                                    Add 0.1 OG (Number)
                                </Button>
                            </div>
                            <div className="mt-3 space-y-2">
                                <Button
                                    onClick={acknowledgeProviders}
                                    disabled={isLoading}
                                    size="sm"
                                    className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Acknowledge Providers"}
                                </Button>
                                <p className="text-xs text-gray-400">
                                    Required before using AI services
                                </p>

                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => allocateToInference(0.5)}
                                        disabled={isLoading}
                                        size="sm"
                                        className="bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30"
                                    >
                                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Initialize Inference Sub-Account"}
                                    </Button>
                                    <Button
                                        onClick={() => allocateToInference(0.1)}
                                        disabled={isLoading}
                                        size="sm"
                                        className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                                    >
                                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Test Sub-Account Init"}
                                    </Button>
                                </div>
                                <div className="mt-2 flex gap-2">
                                    <Button
                                        onClick={() => zgComputeService?.checkInferenceSubAccountStatus()}
                                        disabled={isLoading}
                                        size="sm"
                                        className="bg-purple-500/20 text-purple-400 hover:bg-purple-500/30"
                                    >
                                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Check Sub-Account Status"}
                                    </Button>
                                    <Button
                                        onClick={() => zgComputeService?.tryAlternativeFunding()}
                                        disabled={isLoading}
                                        size="sm"
                                        className="bg-orange-500/20 text-orange-400 hover:bg-orange-500/30"
                                    >
                                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Try Alternative Funding"}
                                    </Button>
                                    <Button
                                        onClick={() => zgComputeService?.forceSubAccountSync()}
                                        disabled={isLoading}
                                        size="sm"
                                        className="bg-red-500/20 text-red-400 hover:bg-red-500/30"
                                    >
                                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Force Sync"}
                                    </Button>
                                </div>
                                <p className="text-xs text-gray-400">
                                    Initialize inference sub-account to enable automatic micropayments
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Error Display */}
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <div className="flex items-center gap-2 text-red-400">
                                <AlertCircle className="w-4 h-4" />
                                <span className="text-sm">{error}</span>
                            </div>
                        </div>
                    )}

                    {/* Chat Test */}
                    <Card className="bg-gray-800/30 border-gray-700/50">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <MessageCircle className="w-4 h-4" />
                                AI Chat Assistant
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex gap-2">
                                <Input
                                    value={chatMessage}
                                    onChange={(e) => setChatMessage(e.target.value)}
                                    placeholder="Analyze transaction 0x123...abc for security risks"
                                    className="bg-gray-700/50 border-gray-600 text-white"
                                    disabled={!isInitialized || isLoading}
                                />
                                <Button
                                    onClick={sendChatMessage}
                                    disabled={!isInitialized || isLoading || !chatMessage.trim()}
                                    className="bg-cyber-cyan/20 text-cyber-cyan hover:bg-cyber-cyan/30"
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send"}
                                </Button>
                            </div>
                            {chatResponse && (
                                <div className="p-3 bg-gray-700/30 rounded-lg">
                                    <p className="text-sm text-gray-300">{chatResponse}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Risk Analysis Test */}
                    <Card className="bg-gray-800/30 border-gray-700/50">
                        <CardHeader>
                            <CardTitle className="text-white">Transaction Risk Analysis</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button
                                onClick={analyzeTransactionRisk}
                                disabled={!isInitialized || isLoading}
                                className="bg-orange-500/20 text-orange-400 hover:bg-orange-500/30"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Analyze Transaction Risk"}
                            </Button>
                            {riskAnalysis && (
                                <div className="p-3 bg-gray-700/30 rounded-lg space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-400">Risk Score:</span>
                                        <Badge variant="outline" className="border-orange-500/30 text-orange-400">
                                            {riskAnalysis.riskScore}/100
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-400">Severity:</span>
                                        <Badge variant="outline" className="border-red-500/30 text-red-400">
                                            {riskAnalysis.severity}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-400">Confidence:</span>
                                        <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                                            {riskAnalysis.confidence}%
                                        </Badge>
                                    </div>
                                    <div className="text-sm text-gray-300">
                                        <strong>AI Provider:</strong> {riskAnalysis.auditTrail.provider || "Local"}
                                    </div>
                                    {riskAnalysis.reasoning.length > 0 && (
                                        <div className="text-sm text-gray-300">
                                            <strong>AI Reasoning:</strong>
                                            <ul className="list-disc list-inside mt-1">
                                                {riskAnalysis.reasoning.map((reason: string, index: number) => (
                                                    <li key={index}>{reason}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Debug Information */}
                    <Card className="bg-gray-800/30 border-gray-700/50">
                        <CardHeader>
                            <CardTitle className="text-white">Debug Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="text-sm text-gray-300">
                                <strong>Client Side:</strong> {isClient ? "Yes" : "No"}
                            </div>
                            <div className="text-sm text-gray-300">
                                <strong>Service Loaded:</strong> {zgComputeService ? "Yes" : "No"}
                            </div>
                            <div className="text-sm text-gray-300">
                                <strong>Wallet Connected:</strong> {isConnected ? "Yes" : "No"}
                            </div>
                            <div className="text-sm text-gray-300">
                                <strong>Initialized:</strong> {isInitialized ? "Yes" : "No"}
                            </div>
                            {address && (
                                <div className="text-sm text-gray-300">
                                    <strong>Wallet Address:</strong> {address}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Instructions */}
                    <Card className="bg-blue-500/10 border-blue-500/30">
                        <CardContent className="pt-6">
                            <div className="text-blue-400 text-sm space-y-2">
                                <p><strong>Setup Instructions:</strong></p>
                                <ol className="list-decimal list-inside space-y-1 ml-4">
                                    <li>Make sure MetaMask is installed and unlocked</li>
                                    <li>Connect your MetaMask wallet using the "Connect Wallet" button</li>
                                    <li>Wait for the service to load (check "Service Loaded" status)</li>
                                    <li>Click "Initialize" to set up 0G Compute</li>
                                    <li>Fund your account with OG tokens if needed</li>
                                    <li>Test AI chat and risk analysis features</li>
                                </ol>
                                <p className="mt-2">
                                    <strong>Note:</strong> No private keys required! The service uses your connected wallet for authentication.
                                </p>
                                <p className="mt-2">
                                    <strong>Troubleshooting:</strong> Check the browser console (F12) for detailed error messages.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </CardContent>
            </Card>
        </div>
    )
}