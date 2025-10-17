
"use client"

// import { ZGComputeSetupTest } from "@/components/zg-compute-integration"
import { useState, useEffect } from "react";
import { WalletProvider } from "@/contexts/wallet-context"
import { BrowserProvider, ethers } from "ethers";
import { createZGComputeNetworkBroker } from "@0glabs/0g-serving-broker";
import OpenAI from "openai";


export default function TestSetupPage() {

    const [provider, setProvider] = useState<BrowserProvider | null>(null)
    const [question, setQuestion] = useState<string>("Hello, how are you?")
    const [broker, setBroker] = useState<any>(null)
    const [selectedProvider, setSelectedProvider] = useState<string>("")
    const [availableProviders, setAvailableProviders] = useState<any[]>([])


    useEffect(() => {
        if (typeof window !== "undefined" && typeof window.ethereum === "undefined") {
            throw new Error("Please install MetaMask");
        }
    }, []);

    const handleConnection = async () => {
        if (typeof window !== "undefined" && window.ethereum) {
            try {
                // First, try to switch to the existing network
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0x40da' }],
                });

                console.log("✅ Successfully switched to 0G Testnet");

            } catch (error: any) {
                console.log("Network switch error:", error);

                // If the network doesn't exist, try to add it
                if (error.code === 4902) {
                    try {
                        await window.ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [{
                                chainId: '0x40da', // 16602 in decimal
                                chainName: '0G Testnet',
                                rpcUrls: ['https://evmrpc-testnet.0g.ai'],
                                blockExplorerUrls: ['https://testnet.0g.ai'],
                                nativeCurrency: {
                                    name: 'OG',
                                    symbol: 'OG',
                                    decimals: 18,
                                },
                            }],
                        });

                        console.log("✅ Successfully added 0G Testnet");

                    } catch (addError: any) {
                        console.log("Failed to add network:", addError);

                        if (addError.message?.includes('nativeCurrency.symbol does not match')) {
                            console.log("⚠️ Network already exists with different symbol");
                            console.log("Please manually switch to 0G Testnet in MetaMask");
                        }
                    }
                } else if (error.message?.includes('nativeCurrency.symbol does not match')) {
                    console.log("⚠️ Network already exists with different currency symbol");
                    console.log("Please manually switch to 0G Testnet in MetaMask");
                }
            }

            // Wait a moment for network switch to complete
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Create provider and broker
            const provider = new BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            const newBroker = await createZGComputeNetworkBroker(signer);
            console.log(newBroker, "newBroker")
            setBroker(newBroker);
            setProvider(provider);
        }
    }

    const handleBroker = async () => {
        if (!broker) {
            console.log("Broker not initialized");
            return;

        }
        try {
            const res = await broker.ledger.addLedger(10);
            console.log(res, "res")
        } catch (e: any) {
            console.log(e, "funding broker")
        }
        try {
            // Add 10 OG tokens


            // Check balance
            const account = await broker.ledger.getLedger();
            console.log(`Balance: ${ethers.formatEther(account.totalBalance)} OG`);
            const services = await broker.inference.listService();
            // const services = await broker.inference.listService();
            const providerAddress = services[0].provider; // This is the address string
            await broker.inference.acknowledgeProviderSigner(providerAddress);

            // Get service details
            const { endpoint, model } = await broker.inference.getServiceMetadata(providerAddress);

            // Generate auth headers (single use)
            // For chat requests, pass JSON stringified messages array
            const messages = [{ role: "user", content: question }];
            const headers = await broker.inference.getRequestHeaders(providerAddress, JSON.stringify(messages));
            const response = await fetch(`${endpoint}/chat/completions`, {
                method: "POST",
                headers: { "Content-Type": "application/json", ...headers },
                body: JSON.stringify({
                    messages: messages,
                    model: model,
                }),
            });

            const data = await response.json();
            const answer = data.choices[0].message.content;
            const chatID = data.id; // Save for verification
            console.log(data, "data")

            // const isValid = await broker.inference.processResponse(
            //     providerAddress,
            //     receivedContent,
            //     chatID // Optional: Only for verifiable services
            //     );




        } catch (error) {
            console.log(error, "broker")
        }
    }

    const checkbalanec = async () => {
        if (!broker) {
            console.log("❌ Broker not initialized. Please connect wallet first.");
            return;
        }

        try {
            console.log("🔍 Checking account balance...");
            const account = await broker.ledger.getLedger();
            console.log("📊 Raw Account Data:", account);

            // Parse the account structure based on the data you showed
            const totalBalance = account[1]; // Total balance (2100000000000000006n)
            const lockedBalance = account[2]; // Locked balance (4100000000000000006n)
            const subAccounts = account[3]; // Sub-accounts array
            const providers = account[5]; // Available providers array

            console.log("📊 Account Overview:");
            console.log(`Total Balance: ${ethers.formatEther(totalBalance)} OG`);
            console.log(`Locked Balance: ${ethers.formatEther(lockedBalance)} OG`);
            console.log(`Available Balance: ${ethers.formatEther(totalBalance - lockedBalance)} OG`);

            // Check sub-accounts
            if (subAccounts && subAccounts.length > 0) {
                console.log("\n🔒 Fine-tuning Sub-accounts:");
                subAccounts.forEach((subAccount: any, index: number) => {
                    console.log(`Sub-account ${index + 1}:`, subAccount);
                    if (subAccount[0]) { // Provider address
                        console.log(`  Provider: ${subAccount[0]}`);
                    }
                    if (subAccount[1]) { // Balance
                        console.log(`  Balance: ${ethers.formatEther(subAccount[1])} OG`);
                    }
                });
            } else {
                console.log("\n💡 No fine-tuning sub-accounts found.");
                console.log("Sub-accounts are created automatically when you submit fine-tuning tasks.");
            }

            // Check available providers
            if (providers && providers.length > 0) {
                console.log("\n🏢 Available Providers:");
                providers.forEach((provider: string, index: number) => {
                    console.log(`  Provider ${index + 1}: ${provider}`);
                });
            }

        } catch (error: any) {
            console.log("❌ Error checking balance:", error);

            if (error.message?.includes('Account does not exist')) {
                console.log("🚨 ACCOUNT NOT FOUND!");
                console.log("Your wallet address doesn't have an account on the 0G network yet.");
                console.log("📝 To create an account, click 'Add Fund' button first.");
                console.log("This will create your account with initial funding.");
            } else if (error.message?.includes('missing trie node') || error.message?.includes('Internal JSON-RPC error')) {
                console.log("🔧 Network issue detected. Try the following:");
                console.log("1. Make sure you're connected to 0G Testnet");
                console.log("2. Try refreshing the page");
                console.log("3. Check if the RPC endpoint is working");
            }
        }
    }

    const addFund = async () => {
        if (!broker) {
            console.log("❌ Broker not initialized. Please connect wallet first.");
            return;
        }

        try {
            console.log("💰 Creating account and adding funds...");
            console.log("This will create your 0G account if it doesn't exist.");
            console.log("⏳ This may take a moment due to network sync issues...");

            const fund = await broker.ledger.addLedger(0.1);
            console.log("✅ Account created/funded successfully:", fund);
            console.log("🎉 Your account is now ready! You can now:");
            console.log("1. Check your balance");
            console.log("2. Transfer funds to sub-accounts");
            console.log("3. Make AI requests");

        } catch (e: any) {
            console.log("❌ Failed to create account/fund:", e);

            if (e.message?.includes('missing trie node') || e.message?.includes('missing revert data')) {
                console.log("🔧 Network sync issue detected. Try these solutions:");
                console.log("1. Wait 30 seconds and try again");
                console.log("2. Refresh the page");
                console.log("3. Try switching to a different network and back");
                console.log("4. Check if the 0G testnet is experiencing issues");
            } else {
                console.log("Make sure you have sufficient ETH for gas fees");
            }
        }
    }

    const depositFund = async () => {
        if (!broker) {
            console.log("❌ Broker not initialized. Please connect wallet first.");
            return;
        }

        try {
            console.log("💰 Depositing funds to your account...");
            console.log("This will add 10 OG tokens to your existing account.");

            const result = await broker.ledger.depositFund(0.2);
            console.log("✅ Deposit successful:", result);
            console.log("🎉 Your account balance has been increased by 10 OG tokens!");
            console.log("You can now:");
            console.log("1. Check your updated balance");
            console.log("2. Transfer funds to sub-accounts");
            console.log("3. Make AI requests");

        } catch (e: any) {
            console.log("❌ Deposit failed:", e);

            if (e.message?.includes('missing trie node') || e.message?.includes('missing revert data')) {
                console.log("🔧 Network sync issue detected. Try these solutions:");
                console.log("1. Wait 30 seconds and try again");
                console.log("2. Refresh the page");
                console.log("3. Try switching to a different network and back");
                console.log("4. Check if the 0G testnet is experiencing issues");
            } else {
                console.log("Make sure you have sufficient ETH for gas fees");
            }
        }
    }

    const checkNetwork = async () => {
        if (typeof window !== "undefined" && window.ethereum) {
            try {
                const chainId = await window.ethereum.request({ method: 'eth_chainId' });
                console.log("Current chain ID:", chainId);
                if (chainId !== '0x40da') {
                    console.log("⚠️ Not on 0G testnet! Current chain:", chainId);
                    console.log("Please switch to 0G Testnet (Chain ID: 0x40da / 16602)");
                    console.log("If you see symbol conflicts, try manually switching in MetaMask");
                } else {
                    console.log("✅ Connected to 0G testnet");

                    // Test RPC connection
                    try {
                        const blockNumber = await window.ethereum.request({ method: 'eth_blockNumber' });
                        console.log("✅ RPC connection working. Latest block:", parseInt(blockNumber, 16));
                    } catch (rpcError) {
                        console.log("❌ RPC connection issue:", rpcError);
                        console.log("The network may be experiencing issues. Try refreshing the page.");
                    }
                }
            } catch (error) {
                console.log("Error checking network:", error);
            }
        }
    }

    const resetNetwork = async () => {
        console.log("🔄 Network Reset Instructions:");
        console.log("1. Open MetaMask");
        console.log("2. Click on the network dropdown");
        console.log("3. If you see '0G Testnet' with wrong symbol, remove it:");
        console.log("   - Click the network name");
        console.log("   - Click 'Remove'");
        console.log("4. Refresh this page");
        console.log("5. Click 'Connect Wallet' again");
        console.log("This will add the correct 0G Testnet configuration.");
    }

    const tryAlternativeRPC = async () => {
        try {
            const fund = await broker.ledger.add_account(0.1);

        } catch (e: any) {
            console.log(e, "ee")
        }
    }

    const listServices = async () => {
        if (!broker) {
            console.log("Broker not initialized");
            return;
        }
        try {
            console.log("Listing services...");
            const services = await broker.inference.listService();
            console.log("Available services:", services);

            if (services.length === 0) {
                console.log("No services found on testnet. This is normal for testnet.");
                console.log("You can still transfer funds using the official provider addresses.");
                setAvailableProviders([]);
                return [];
            }

            // Update the available providers state
            setAvailableProviders(services);

            // Auto-select first provider if none selected
            if (!selectedProvider && services.length > 0) {
                setSelectedProvider(services[0][0]); // Provider address
            }

            return services;
        } catch (e: any) {
            console.log(e, "error listing services");
            setAvailableProviders([]);
        }
    }

    const transferToFineTuning = async () => {
        if (!broker) {
            console.log("Broker not initialized");
            return;
        }
        try {
            // Use selected provider or fallback to official address
            const providerAddress = selectedProvider || "0xf07240Efa67755B5311bc75784a061eDB47165Dd";
            console.log("Using provider:", providerAddress);

            const serviceTypeStr = "fineTuning"; // Transfer to fine-tuning sub-account
            const amount = ethers.parseEther("0.1"); // Transfer 0.1 OG token (as per CLI docs)

            console.log(`Transferring ${ethers.formatEther(amount)} OG to fine-tuning sub-account...`);

            const result = await broker.ledger.transferFund(
                providerAddress,
                serviceTypeStr,
                amount,
                undefined // gasPrice - can be undefined for default
            );

            console.log("✅ Transfer successful:", result);
            console.log("You can now create fine-tuning tasks with this provider");
        } catch (e: any) {
            console.log("❌ Transfer failed:", e);
            console.log("Make sure you have sufficient balance and are on the correct network");
        }
    }

    const transferToInference = async () => {
        if (!broker) {
            console.log("Broker not initialized");
            return;
        }
        try {
            // Use selected provider or fallback to official address
            const providerAddress = selectedProvider || "0xf07240Efa67755B5311bc75784a061eDB47165Dd";
            console.log("Using provider:", providerAddress);

            const serviceTypeStr = "inference"; // Transfer to inference sub-account
            const amount = ethers.parseEther("0.1"); // Transfer 0.1 OG token

            console.log(`Transferring ${ethers.formatEther(amount)} OG to inference sub-account...`);

            const result = await broker.ledger.transferFund(
                providerAddress,
                serviceTypeStr,
                amount,
                undefined // gasPrice - can be undefined for default
            );

            console.log("✅ Transfer successful:", result);
            console.log("You can now use inference services with this provider");
        } catch (e: any) {
            console.log("❌ Transfer failed:", e);
            console.log("Make sure you have sufficient balance and are on the correct network");
        }
    }

    const retrieveFunds = async () => {
        if (!broker) {
            console.log("Broker not initialized");
            return;
        }
        try {
            console.log("🔄 Requesting funds return from all sub-accounts...");
            console.log("Note: Funds will be available after 24-hour lock period");

            const result = await broker.ledger.retrieveFund("fineTuning");
            console.log("✅ Retrieve request submitted:", result);
            console.log("Check back in 24 hours to complete the refund");
        } catch (e: any) {
            console.log("❌ Retrieve request failed:", e);
        }
    }

    const makeAIRequest = async () => {
        if (!broker) {
            console.log("Broker not initialized");
            return;
        }
        try {
            console.log("🤖 Making AI request...");

            // First, get available services
            const services = await broker.inference.listService();
            console.log("📋 Available services:", services);

            if (services.length === 0) {
                console.log("❌ No services available");
                return;
            }

            // Use selected provider or try all providers
            const providersToTry = selectedProvider ?
                services.filter((s: any) => s[0] === selectedProvider) :
                services;

            if (providersToTry.length === 0) {
                console.log("❌ No providers available or selected provider not found");
                return;
            }

            for (let i = 0; i < providersToTry.length; i++) {
                const service = providersToTry[i];
                const providerAddress = service[0]; // Provider address
                const endpoint = service[2]; // Service URL
                const model = service[6]; // Model name

                console.log(`🔄 Trying provider ${i + 1}/${providersToTry.length}: ${providerAddress}`);
                console.log(`Endpoint: ${endpoint}`);
                console.log(`Model: ${model}`);

                try {

                    // Acknowledge provider
                    console.log("📝 Acknowledging provider...");
                    await broker.inference.acknowledgeProviderSigner(providerAddress);

                    // Get service metadata
                    console.log("🔍 Getting service metadata...");
                    const { endpoint: metaEndpoint, model: metaModel } = await broker.inference.getServiceMetadata(providerAddress);
                    console.log(`Meta Endpoint: ${metaEndpoint}`);
                    console.log(`Meta Model: ${metaModel}`);

                    // Generate auth headers
                    const messages = [{ role: "user" as const, content: "What is the capital of France?" }];
                    console.log("🔐 Generating auth headers...");
                    const headers = await broker.inference.getRequestHeaders(providerAddress, JSON.stringify(messages));

                    // Make the request using OpenAI SDK
                    console.log("📤 Sending request to AI service...");
                    console.log("Request details:");
                    console.log("- Endpoint:", metaEndpoint);
                    console.log("- Model:", metaModel);
                    console.log("- Messages:", messages);
                    console.log("- Headers:", headers);

                    const openai = new OpenAI({
                        baseURL: metaEndpoint,
                        apiKey: "", // Empty string
                        defaultHeaders: headers,
                        dangerouslyAllowBrowser: true
                    });

                    const completion = await openai.chat.completions.create({
                        messages: messages,
                        model: metaModel,
                    });

                    const answer = completion.choices[0].message.content!;
                    const chatID = completion.id; // Save for verification

                    console.log("✅ AI Response:");
                    console.log(`Question: What is the capital of France?`);
                    console.log(`Answer: ${answer}`);
                    console.log(`Chat ID: ${chatID}`);

                    // Optional: Verify the response
                    try {
                        console.log("🔍 Verifying response...");
                        const isValid = await broker.inference.processResponse(
                            providerAddress,
                            answer,
                            chatID
                        );
                        console.log(`Response verification: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
                    } catch (verifyError) {
                        console.log("⚠️ Verification failed:", verifyError);
                    }

                    // If we get here, the request was successful
                    console.log("🎉 AI request completed successfully!");
                    return;

                } catch (providerError: any) {
                    console.log(`❌ Provider ${i + 1} failed:`, providerError.message);

                    if (providerError.message?.includes('insufficient balance')) {
                        console.log("💰 INSUFFICIENT BALANCE ERROR!");
                        console.log("Your inference sub-account has no funds.");
                        console.log("📝 SOLUTION: Click 'Transfer to Inference' button first!");
                        console.log("This will transfer 0.1 OG to your inference sub-account.");
                        return; // Stop trying other providers
                    } else if (providerError.message?.includes('ERR_TUNNEL_CONNECTION_FAILED') ||
                        providerError.message?.includes('Failed to fetch')) {
                        console.log("🔧 Network connectivity issue with this provider");
                        continue; // Try next provider
                    } else {
                        console.log("🔧 Other error with this provider");
                        continue; // Try next provider
                    }
                }
            }

            console.log("❌ All providers failed. This might be a network connectivity issue.");
            console.log("💡 Try these solutions:");
            console.log("1. Check your internet connection");
            console.log("2. Try using a VPN");
            console.log("3. Wait a few minutes and try again");
            console.log("4. The Phala network endpoints might be temporarily unavailable");

        } catch (e: any) {
            console.log("❌ AI request failed:", e);
            console.log("Make sure you have sufficient balance in your inference sub-account");
        }
    }







    return (
        <WalletProvider>
            <div className="min-h-screen bg-gradient-to-br from-cyber-dark via-gray-900 to-black p-8">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-3xl font-bold text-white mb-8 text-center">0G Compute Network Test</h1>

                    {/* Connection Section */}
                    <div className="bg-gray-800 rounded-lg p-6 mb-6">
                        <h2 className="text-xl font-semibold text-white mb-4">🔗 Connection</h2>
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={handleConnection}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                Connect Wallet
                            </button>
                            <button
                                onClick={checkNetwork}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                Check Network
                            </button>
                            <button
                                onClick={resetNetwork}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                Reset Network
                            </button>
                            <button
                                onClick={tryAlternativeRPC}
                                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                Alternative RPC
                            </button>
                        </div>
                    </div>

                    {/* Account Management Section */}
                    <div className="bg-gray-800 rounded-lg p-6 mb-6">
                        <h2 className="text-xl font-semibold text-white mb-4">💰 Account Management</h2>
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={checkbalanec}
                                disabled={!broker}
                                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                Check Balance
                            </button>
                            <button
                                onClick={addFund}
                                disabled={!broker}
                                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                Add Fund
                            </button>
                            <button
                                onClick={depositFund}
                                disabled={!broker}
                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                Deposit Fund
                            </button>
                            <button
                                onClick={retrieveFunds}
                                disabled={!broker}
                                className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                Retrieve Funds
                            </button>
                        </div>
                    </div>

                    {/* Service Discovery Section */}
                    <div className="bg-gray-800 rounded-lg p-6 mb-6">
                        <h2 className="text-xl font-semibold text-white mb-4">🔍 Service Discovery</h2>
                        <div className="flex flex-wrap gap-3 mb-4">
                            <button
                                onClick={listServices}
                                disabled={!broker}
                                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                List Services
                            </button>
                            <button
                                onClick={handleBroker}
                                disabled={!broker}
                                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                Test Broker
                            </button>
                        </div>

                        {/* Provider Selection */}
                        {availableProviders.length > 0 && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Select AI Provider:
                                </label>
                                <select
                                    value={selectedProvider}
                                    onChange={(e) => setSelectedProvider(e.target.value)}
                                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select a provider...</option>
                                    {availableProviders.map((provider, index) => (
                                        <option key={provider[0]} value={provider[0]}>
                                            {provider[6]} - {provider[0].slice(0, 8)}...{provider[0].slice(-6)}
                                        </option>
                                    ))}
                                </select>
                                {selectedProvider && (
                                    <div className="mt-2 text-sm text-gray-400">
                                        Selected: {availableProviders.find(p => p[0] === selectedProvider)?.[6]}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Fund Transfer Section */}
                    <div className="bg-gray-800 rounded-lg p-6 mb-6">
                        <h2 className="text-xl font-semibold text-white mb-4">💸 Fund Transfer</h2>
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={transferToInference}
                                disabled={!broker}
                                className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                Transfer to Inference
                            </button>
                            <button
                                onClick={transferToFineTuning}
                                disabled={!broker}
                                className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                Transfer to Fine-Tuning
                            </button>
                        </div>
                    </div>

                    {/* AI Request Section */}
                    <div className="bg-gray-800 rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-white mb-4">🤖 AI Request</h2>
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={makeAIRequest}
                                disabled={!broker}
                                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-colors font-medium"
                            >
                                Make AI Request
                            </button>
                        </div>
                        <p className="text-gray-400 text-sm mt-2">
                            Ask: "What is the capital of France?"
                        </p>
                    </div>
                </div>
            </div>
        </WalletProvider>
    )
}
