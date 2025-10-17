"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, Loader2, Wallet, MessageCircle, Play, ArrowRight } from "lucide-react"
import { useWallet } from "@/contexts/wallet-context"

export function ZGComputeSetupTest() {
    const { isConnected, address, connect, isConnecting } = useWallet()
    const [isInitialized, setIsInitialized] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [balance, setBalance] = useState<string | null>(null)
    const [services, setServices] = useState<any[]>([])
    const [selectedProvider, setSelectedProvider] = useState<string>("")
    const [testMessage, setTestMessage] = useState("")
    const [response, setResponse] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [isClient, setIsClient] = useState(false)
    const [zgComputeService, setZgComputeService] = useState<any>(null)
    const [currentStep, setCurrentStep] = useState(1)

    // Ensure we're on the client side
    useEffect(() => {
        setIsClient(true)
    }, [])

    // Load 0G Compute service
    useEffect(() => {
        if (isClient && isConnected) {
            const loadService = async () => {
                try {
                    const { zgComputeService } = await import("@/lib/0g-compute")
                    // Initialize the service if it's not already initialized
                    if (!zgComputeService.isInitialized) {
                        await zgComputeService.initialize()
                    }
                    setZgComputeService(zgComputeService)
                    setIsInitialized(true)
                    console.log("✅ 0G Compute service loaded and initialized")
                } catch (error) {
                    console.error("❌ Failed to load 0G Compute service:", error)
                    setError("Failed to load 0G Compute service")
                }
            }
            loadService()
        }
    }, [isClient, isConnected])

    const initializeService = async () => {
        if (!zgComputeService) return

        setIsLoading(true)
        setError(null)

        try {
            console.log("🔄 Verifying 0G Compute service status...")
            // The service should already be initialized, just verify it's working
            const balance = await zgComputeService.getAccountBalance()
            console.log("✅ Service is working, balance:", balance)
            setCurrentStep(2)
        } catch (err) {
            console.error("Service verification error:", err)
            setError(err instanceof Error ? err.message : "Unknown error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    const fundAccount = async (amount: number = 1) => {
        if (!zgComputeService) return

        setIsLoading(true)
        setError(null)

        try {
            console.log(`🔄 Adding ${amount} OG to account...`)
            const success = await zgComputeService.addFunds(amount)
            if (success) {
                const accountBalance = await zgComputeService.getAccountBalance()
                setBalance(accountBalance?.balance || "0.0000 OG")
                setCurrentStep(3)
                console.log("✅ Account funded")
            } else {
                setError("Failed to fund account")
            }
        } catch (err) {
            console.error("Funding error:", err)
            setError(err instanceof Error ? err.message : "Unknown error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    const discoverServices = async () => {
        if (!zgComputeService) return

        setIsLoading(true)
        setError(null)

        try {
            console.log("🔄 Discovering available services...")
            const servicesList = await zgComputeService.listAvailableServices()
            setServices(servicesList)
            if (servicesList.length > 0) {
                setSelectedProvider(servicesList[0].provider)
                setCurrentStep(4)
            }
            console.log("✅ Services discovered")
        } catch (err) {
            console.error("Service discovery error:", err)
            setError(err instanceof Error ? err.message : "Unknown error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    const acknowledgeProvider = async () => {
        if (!zgComputeService || !selectedProvider) return

        setIsLoading(true)
        setError(null)

        try {
            console.log(`🔄 Acknowledging provider: ${selectedProvider}...`)
            await zgComputeService.acknowledgeProvider(selectedProvider)
            setCurrentStep(5)
            console.log("✅ Provider acknowledged")
        } catch (err) {
            console.error("Provider acknowledgment error:", err)
            setError(err instanceof Error ? err.message : "Unknown error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    const transferFundsToInference = async (amount: number = 0.5) => {
        if (!zgComputeService) return

        setIsLoading(true)
        setError(null)

        try {
            console.log(`🔄 Transferring ${amount} OG to inference sub-account...`)
            const success = await zgComputeService.transferFundsToInference(amount)
            if (success) {
                const accountBalance = await zgComputeService.getAccountBalance()
                setBalance(accountBalance?.balance || "0.0000 OG")
                setCurrentStep(6)
                console.log("✅ Funds transferred to inference")
            } else {
                setError("Failed to transfer funds to inference")
            }
        } catch (err) {
            console.error("Transfer error:", err)
            setError(err instanceof Error ? err.message : "Unknown error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    const testInference = async () => {
        if (!zgComputeService || !selectedProvider || !testMessage.trim()) return

        setIsLoading(true)
        setError(null)

        try {
            console.log("🔄 Testing inference request...")
            const result = await zgComputeService.chat({
                message: testMessage,
                context: {
                    userRole: "user",
                    provider: selectedProvider
                }
            })

            if (result.success) {
                setResponse(result.response)
                setCurrentStep(7)
                console.log("✅ Inference test successful")
            } else {
                setError(result.error || "Inference failed")
            }
        } catch (err) {
            console.error("Inference error:", err)
            setError(err instanceof Error ? err.message : "Unknown error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    const resetTest = () => {
        setCurrentStep(1)
        setIsInitialized(false)
        setBalance(null)
        setServices([])
        setSelectedProvider("")
        setTestMessage("")
        setResponse("")
        setError(null)
    }

    if (!isClient) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="text-center text-white">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                    <p>Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            {/* Header */}
            <Card className="bg-gradient-to-br from-cyber-dark to-gray-900 border-cyber-cyan/20">
                <CardHeader>
                    <CardTitle className="text-cyber-cyan flex items-center gap-2">
                        <Play className="w-5 h-5" />
                        0G Compute SDK Setup Test
                    </CardTitle>
                    <p className="text-gray-400">
                        Follow the exact 0G documentation flow to test the complete setup
                    </p>
                </CardHeader>
            </Card>

            {/* Wallet Connection */}
            <Card className="bg-gray-800/30 border-gray-700/50">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Wallet className="w-4 h-4" />
                        Step 1: Connect Wallet
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {!isConnected ? (
                        <Button
                            onClick={connect}
                            disabled={isConnecting}
                            className="bg-cyber-cyan/20 text-cyber-cyan hover:bg-cyber-cyan/30"
                        >
                            {isConnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Connect MetaMask"}
                        </Button>
                    ) : (
                        <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            <span className="text-white">Connected: {address?.slice(0, 6)}...{address?.slice(-4)}</span>
                            <Badge variant="outline" className="border-green-400/30 text-green-400">
                                Step 1 Complete
                            </Badge>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Initialize Broker */}
            <Card className="bg-gray-800/30 border-gray-700/50">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <ArrowRight className="w-4 h-4" />
                        Step 2: Verify Service Status
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {isInitialized ? (
                                <CheckCircle className="w-5 h-5 text-green-400" />
                            ) : (
                                <AlertCircle className="w-5 h-5 text-yellow-400" />
                            )}
                            <span className="text-white">
                                Broker Status: {isInitialized ? "Initialized" : "Not Initialized"}
                            </span>
                        </div>
                        <Button
                            onClick={initializeService}
                            disabled={isLoading || isInitialized || !isConnected}
                            className="bg-cyber-cyan/20 text-cyber-cyan hover:bg-cyber-cyan/30"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Service Status"}
                        </Button>
                    </div>
                    {isInitialized && (
                        <Badge variant="outline" className="border-green-400/30 text-green-400 mt-2">
                            Step 2 Complete
                        </Badge>
                    )}
                </CardContent>
            </Card>

            {/* Fund Account */}
            <Card className="bg-gray-800/30 border-gray-700/50">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <ArrowRight className="w-4 h-4" />
                        Step 3: Fund Account
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {balance && (
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-green-400" />
                                <span className="text-white">Balance: {balance}</span>
                            </div>
                        )}
                        <div className="flex gap-2">
                            <Button
                                onClick={() => fundAccount(1)}
                                disabled={isLoading || !isInitialized}
                                className="bg-green-500/20 text-green-400 hover:bg-green-500/30"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add 1 OG"}
                            </Button>
                            <Button
                                onClick={() => fundAccount(5)}
                                disabled={isLoading || !isInitialized}
                                className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add 5 OG"}
                            </Button>
                        </div>
                        {balance && (
                            <Badge variant="outline" className="border-green-400/30 text-green-400">
                                Step 3 Complete
                            </Badge>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Discover Services */}
            <Card className="bg-gray-800/30 border-gray-700/50">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <ArrowRight className="w-4 h-4" />
                        Step 4: Discover Services
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <Button
                            onClick={discoverServices}
                            disabled={isLoading || !isInitialized}
                            className="bg-purple-500/20 text-purple-400 hover:bg-purple-500/30"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Discover Services"}
                        </Button>
                        {services.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-white">Available Services:</p>
                                {services.map((service, index) => (
                                    <div key={index} className="p-2 bg-gray-700/30 rounded">
                                        <p className="text-sm text-white">Model: {service.model}</p>
                                        <p className="text-xs text-gray-400">Provider: {service.provider}</p>
                                        <p className="text-xs text-gray-400">Verification: {service.verifiability}</p>
                                    </div>
                                ))}
                                <Badge variant="outline" className="border-green-400/30 text-green-400">
                                    Step 4 Complete
                                </Badge>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Acknowledge Provider */}
            <Card className="bg-gray-800/30 border-gray-700/50">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <ArrowRight className="w-4 h-4" />
                        Step 5: Acknowledge Provider
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <Button
                            onClick={acknowledgeProvider}
                            disabled={isLoading || !isInitialized || !selectedProvider}
                            className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Acknowledge Provider"}
                        </Button>
                        {selectedProvider && (
                            <p className="text-sm text-gray-400">Selected: {selectedProvider}</p>
                        )}
                        {currentStep >= 5 && (
                            <Badge variant="outline" className="border-green-400/30 text-green-400">
                                Step 5 Complete
                            </Badge>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Transfer Funds to Inference */}
            <Card className="bg-gray-800/30 border-gray-700/50">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <ArrowRight className="w-4 h-4" />
                        Step 6: Transfer Funds to Inference
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex gap-2">
                            <Button
                                onClick={() => transferFundsToInference(0.5)}
                                disabled={isLoading || !isInitialized}
                                className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Transfer 0.5 OG"}
                            </Button>
                            <Button
                                onClick={() => transferFundsToInference(1.0)}
                                disabled={isLoading || !isInitialized}
                                className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Transfer 1.0 OG"}
                            </Button>
                        </div>
                        <p className="text-xs text-emerald-400">
                            💡 This transfers funds from main account to inference sub-account
                        </p>
                        {currentStep >= 6 && (
                            <Badge variant="outline" className="border-green-400/30 text-green-400">
                                Step 6 Complete
                            </Badge>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Test Inference */}
            <Card className="bg-gray-800/30 border-gray-700/50">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        Step 7: Test Inference
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex gap-2">
                            <Input
                                value={testMessage}
                                onChange={(e) => setTestMessage(e.target.value)}
                                placeholder="Enter your test message..."
                                className="bg-gray-700/50 border-gray-600 text-white"
                                disabled={isLoading || !isInitialized}
                            />
                            <Button
                                onClick={testInference}
                                disabled={isLoading || !isInitialized || !testMessage.trim()}
                                className="bg-cyber-cyan/20 text-cyber-cyan hover:bg-cyber-cyan/30"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Test"}
                            </Button>
                        </div>
                        {response && (
                            <div className="p-3 bg-gray-700/30 rounded-lg">
                                <p className="text-sm text-white">Response:</p>
                                <p className="text-gray-300">{response}</p>
                                <Badge variant="outline" className="border-green-400/30 text-green-400 mt-2">
                                    Step 7 Complete - Setup Successful!
                                </Badge>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Error Display */}
            {error && (
                <Card className="bg-red-900/20 border-red-500/30">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 text-red-400">
                            <AlertCircle className="w-4 h-4" />
                            <span>Error: {error}</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Reset Button */}
            <div className="flex justify-center">
                <Button
                    onClick={resetTest}
                    variant="outline"
                    className="border-gray-600 text-gray-400 hover:bg-gray-700/30"
                >
                    Reset Test
                </Button>
            </div>
        </div>
    )
}
