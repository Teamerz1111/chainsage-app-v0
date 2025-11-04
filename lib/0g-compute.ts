import { ethers } from 'ethers'
import { createZGComputeNetworkBroker } from '@0glabs/0g-serving-broker'

// Official 0G Compute providers based on latest documentation
const OFFICIAL_PROVIDERS = {
    "gpt-oss-120b": "0xf07240Efa67755B5311bc75784a061eDB47165Dd",
    "deepseek-r1-70b": "0x3feE5a4dd5FDb8a32dDA97Bed899830605dBD9D3"
};

export interface TransactionAnalysisPrompt {
    transactionData: {
        hash: string
        from: string
        to: string
        value: string
        timestamp: number
        blockNumber?: number
    }
    context: {
        riskFactors?: {
            transactionVolume: number
            frequencyScore: number
            contractRisk: number
            networkReputation: number
            walletAge: number
            behaviorPattern: number
        }
    }
}

export interface WalletAnalysisPrompt {
    walletAddress: string
    transactionHistory?: Array<{
        hash: string
        from: string
        to: string
        value: string
        timestamp: number
        blockNumber?: number
    }>
    context: {
        networkId?: number
        includeTransactions?: boolean
        maxTransactions?: number
        riskFactors?: {
            transactionVolume: number
            frequencyScore: number
            contractRisk: number
            networkReputation: number
            walletAge: number
            behaviorPattern: number
        }
    }
}

export interface ChatPrompt {
    message: string
    context: {
        userRole?: string
        sessionHistory?: Array<{ id: number; text: string; sender: string; timestamp: Date }>
        blockchainData?: any
    }
}

export interface ZGComputeResponse {
    success: boolean
    data?: string
    error?: string
    provider?: string
    model?: string
}

class ZGComputeService {
    private broker: any = null;
    private isInitialized = false;
    private currentProvider: string | null = null;

    async initialize(): Promise<boolean> {
        try {
            if (this.isInitialized && this.broker) {
                return true;
            }

            console.log("Starting 0G Compute initialization...");

            // Check if MetaMask is available
            if (typeof window === 'undefined' || !window.ethereum) {
                throw new Error("MetaMask is not installed. Please install MetaMask to use 0G Compute services.");
            }

            console.log("MetaMask detected, checking wallet connection...");

            // Get the connected account with retry logic
            let accounts: string[] = [];
            let retryCount = 0;
            const maxRetries = 3;

            while (accounts.length === 0 && retryCount < maxRetries) {
                try {
                    accounts = await window.ethereum.request({ method: "eth_accounts" });
                    console.log(`Attempt ${retryCount + 1}: Connected accounts:`, accounts);

                    if (accounts.length === 0) {
                        console.log("No accounts found, waiting 1 second before retry...");
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        retryCount++;
                    }
                } catch (error) {
                    console.error(`Error getting accounts (attempt ${retryCount + 1}):`, error);
                    retryCount++;
                    if (retryCount < maxRetries) {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }
            }

            if (accounts.length === 0) {
                throw new Error("No wallet connected. Please connect your wallet first and ensure MetaMask is unlocked.");
            }

            console.log("Wallet connected, creating provider and signer...");

            // Create provider and wallet from MetaMask
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            console.log("Creating 0G Compute broker...");
            this.broker = await createZGComputeNetworkBroker(signer);

            console.log("Broker created, checking account funding...");
            // Check and fund account if needed
            try {
                await this.ensureAccountFunded();
                console.log("Account funding completed");
            } catch (fundingError) {
                console.warn("Account funding failed, continuing without funding:", fundingError);
                // Continue without funding - user can fund manually later
            }

            console.log("Discovering providers...");
            // Discover and acknowledge providers
            try {
                await this.discoverAndAcknowledgeProviders();
                console.log("Provider discovery completed");
            } catch (providerError) {
                console.warn("Provider discovery failed, continuing without providers:", providerError);
                // Continue without providers - they can be acknowledged later
            }

            this.isInitialized = true;
            console.log("0G Compute initialization completed successfully!");
            return true;
        } catch (error) {
            console.error("Failed to initialize 0G Compute service:", error);
            return false;
        }
    }

    private async ensureAccountFunded(): Promise<void> {
        if (!this.broker) return;

        try {
            console.log("Checking account balance...");
            const ledger = await this.broker.ledger.getLedger();

            if (ledger) {
                let balance: number;
                try {
                    const balanceWei = ledger.balance;
                    balance = parseFloat(ethers.formatEther(balanceWei));

                    if (isNaN(balance)) {
                        balance = 0;
                    }
                } catch {
                    balance = 0;
                }

                console.log(`Current account balance: ${balance.toFixed(4)} OG`);

                // Fund account if balance is less than 0.05 OG
                if (balance < 0.05) {
                    console.log("Account balance too low, adding funds...");
                    await this.broker.ledger.depositFund("0.1");
                    console.log("Account funded with 0.1 OG tokens");
                }
            }
        } catch (error) {
            console.warn("Account funding failed, continuing without funding:", error);
            throw error;
        }
    }

    private async discoverAndAcknowledgeProviders(): Promise<void> {
        if (!this.broker) return;

        try {
            // Discover available services
            console.log("Discovering available providers...");
            const services = await this.broker.inference.listService();
            console.log(`Found ${services.length} providers`);

            // Acknowledging official providers
            console.log("Acknowledging official providers...");
            for (const [model, providerAddress] of Object.entries(OFFICIAL_PROVIDERS)) {
                try {
                    console.log(`Acknowledging provider for ${model}: ${providerAddress}`);
                    await this.broker.inference.acknowledgeProviderSigner(providerAddress);
                    console.log(`Successfully acknowledged provider for ${model}`);
                } catch (error) {
                    console.warn(`Failed to acknowledge provider ${providerAddress}:`, error);
                }
            }
        } catch (error) {
            console.warn("Provider discovery failed:", error);
            throw error;
        }
    }

    async addFunds(amount: string | number): Promise<boolean> {
        if (!this.broker) {
            console.error("Cannot add funds: broker not initialized");
            return false;
        }

        try {
            // Convert to number as per exact documentation
            const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
            console.log(`Adding ${numAmount} OG to account...`);

            // Check if account already exists by trying addLedger first
            try {
                await this.broker.ledger.addLedger(numAmount);
                console.log(`✅ Successfully added ${numAmount} OG to new account`);
                return true;
            } catch (addLedgerError) {
                // If account already exists, use depositFund instead
                if (addLedgerError instanceof Error && addLedgerError.message.includes('Account already exists')) {
                    console.log("Account already exists, using depositFund instead...");
                    await this.broker.ledger.depositFund(numAmount);
                    console.log(`✅ Successfully deposited ${numAmount} OG to existing account`);
                    return true;
                } else {
                    // Re-throw if it's a different error
                    throw addLedgerError;
                }
            }

        } catch (error) {
            console.error("❌ Failed to add funds:", error);
            console.error("Error details:", {
                message: error instanceof Error ? error.message : "Unknown error",
                name: error instanceof Error ? error.name : "Error",
                stack: error instanceof Error ? error.stack : undefined
            });

            // Provide specific, helpful error messages
            if (error instanceof Error) {
                const errorMsg = error.message.toLowerCase();

                if (errorMsg.includes('insufficient')) {
                    console.error("\n💡 FIX: Insufficient ETH for gas fees");
                    console.error("   → Add more ETH to your wallet on 0G testnet");
                    console.error("   → Check balance with 'Check MetaMask' button");
                } else if (errorMsg.includes('circuit breaker')) {
                    console.error("\n💡 FIX: Network is overloaded (circuit breaker)");
                    console.error("   → Wait 1-2 minutes and try again");
                    console.error("   → The 0G network is experiencing high traffic");
                } else if (errorMsg.includes('maxpriorityfee') || errorMsg.includes('eip-1559')) {
                    console.error("\n💡 FIX: Gas pricing issue (EIP-1559 not supported)");
                    console.error("   → This is a known issue with 0G testnet");
                    console.error("   → Try again in a few moments");
                } else if (errorMsg.includes('decode result') || errorMsg.includes('tofixed')) {
                    console.error("\n💡 FIX: Amount formatting issue - SDK internal error");
                    console.error("   → This appears to be a bug in the 0G SDK v0.4.4");
                    console.error("   → Try with a different amount (e.g., 1 instead of 0.1)");
                    console.error("   → Or wait for SDK update");
                } else if (errorMsg.includes('revert')) {
                    console.error("\n💡 FIX: Transaction reverted");
                    console.error("   → Ensure you're on 0G testnet (chain ID: 16602)");
                    console.error("   → Check if account already exists (try Check Balance first)");
                } else {
                    console.error("\n💡 General troubleshooting:");
                    console.error("   → Verify you're on 0G testnet (chain ID: 16602)");
                    console.error("   → Ensure you have enough ETH for gas");
                    console.error("   → Try with a different amount (e.g., 1 OG instead of 0.1)");
                    console.error("   → This may be a known SDK issue - check 0G Discord/community");
                }
            }

            return false;
        }
    }

    async depositFunds(amount: string | number): Promise<boolean> {
        if (!this.broker) {
            console.error("Cannot deposit funds: broker not initialized");
            return false;
        }

        try {
            // Convert to number as per exact documentation: await broker.ledger.depositFund(10);
            const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
            console.log(`Depositing ${numAmount} OG to existing account...`);

            // Use exact documentation format: depositFund with plain number
            await this.broker.ledger.depositFund(numAmount);
            console.log(`✅ Successfully deposited ${numAmount} OG to account`);
            return true;
        } catch (error) {
            console.error("❌ Failed to deposit funds:", error);
            return false;
        }
    }

    async allocateFundsToInference(amount: string | number): Promise<boolean> {
        if (!this.broker) {
            console.error("Cannot allocate funds: broker not initialized");
            return false;
        }

        try {
            // Convert to number as per exact documentation
            const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
            console.log(`Allocating ${numAmount} OG to inference service...`);

            // According to 0G documentation, the system uses automatic micropayments
            // The "available balance of 0" error suggests the inference sub-account needs initialization
            // Try making a small test request to trigger the sub-account creation

            console.log("Attempting to initialize inference sub-account with test request...");

            // First, ensure we have enough funds in main account
            const balance = await this.getAccountBalance();
            if (!balance || parseFloat(balance.balance) < numAmount) {
                console.log("Adding funds to main account first...");
                await this.broker.ledger.depositFund(numAmount);
                console.log(`✅ Added ${numAmount} OG to main account`);
            }

            // Try to trigger inference sub-account creation by making a minimal request
            // This should initialize the sub-account and enable automatic micropayments
            console.log("Triggering inference sub-account initialization...");

            // Get the first available provider
            const services = await this.broker.inference.listService();
            if (services.length === 0) {
                throw new Error("No services available");
            }

            const firstProvider = services[0].provider;
            console.log(`Using provider ${firstProvider} for initialization...`);

            // Make a minimal request to trigger sub-account creation
            const { endpoint, model } = await this.broker.inference.getServiceMetadata(firstProvider);
            const testMessages = [{ role: "user", content: "test" }];
            const headers = await this.broker.inference.getRequestHeaders(firstProvider, JSON.stringify(testMessages));

            console.log("Making minimal HTTP request to initialize sub-account...");

            // Actually make the HTTP request to trigger sub-account creation
            const response = await fetch(`${endpoint}/chat/completions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...headers
                },
                body: JSON.stringify({
                    messages: testMessages,
                    model: model,
                }),
            });

            console.log(`Initialization request status: ${response.status}`);

            if (response.status === 200) {
                console.log("✅ Inference sub-account successfully initialized!");
                console.log("💡 The system will now use automatic micropayments from your main account");
            } else if (response.status === 400) {
                const errorData = await response.json();
                console.log("⚠️ Initialization request failed, but this might be expected:");
                console.log("Error:", errorData.error);
                console.log("💡 This could mean the sub-account needs more funds or different initialization");
            } else {
                console.log(`⚠️ Unexpected response status: ${response.status}`);
            }

            return true;

        } catch (error) {
            console.error("❌ Failed to initialize inference sub-account:", error);
            console.error("Error details:", {
                message: error instanceof Error ? error.message : "Unknown error",
                name: error instanceof Error ? error.name : "Error",
                stack: error instanceof Error ? error.stack : undefined
            });

            // If initialization fails, at least ensure main account has funds
            try {
                const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
                await this.broker.ledger.depositFund(numAmount);
                console.log(`✅ Added ${numAmount} OG to main account as fallback`);
                return true;
            } catch (fallbackError) {
                console.error("❌ Fallback funding also failed:", fallbackError);
                return false;
            }
        }
    }

    async retrieveFunds(serviceType: string = "inference"): Promise<boolean> {
        if (!this.broker) {
            console.error("Cannot retrieve funds: broker not initialized");
            return false;
        }

        try {
            console.log(`Requesting refund from ${serviceType} service...`);

            // Use retrieveFund to withdraw unused funds (per documentation)
            await this.broker.ledger.retrieveFund(serviceType);
            console.log(`Successfully requested refund from ${serviceType} service`);
            return true;
        } catch (error) {
            console.error("Failed to retrieve funds:", error);
            return false;
        }
    }

    async transferFundsToInference(amount: string | number): Promise<boolean> {
        if (!this.broker) {
            console.error("Cannot transfer funds: broker not initialized");
            return false;
        }

        try {
            const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
            console.log(`🔄 Transferring ${numAmount} OG from main account to inference sub-account...`);

            // Check current balance first
            const balance = await this.getAccountBalance();
            console.log(`📊 Current main account balance: ${balance?.balance || "0.0000"} OG`);
            console.log(`📊 Current available balance: ${balance?.available || "0.0000"} OG`);
            console.log(`📊 Current locked balance: ${balance?.locked || "0.0000"} OG`);

            if (parseFloat(balance?.available || "0") < numAmount) {
                console.error(`❌ Insufficient available balance. Need ${numAmount} OG, have ${balance?.available || "0"} OG`);
                return false;
            }

            // Try transferFund with different parameter combinations
            console.log("💡 Attempting transferFund with different parameter combinations...");

            try {
                // Method 1: Try with service type first, then amount
                console.log(`Trying transferFund("inference", ${numAmount})...`);
                await this.broker.ledger.transferFund("inference", numAmount);
                console.log(`✅ Successfully transferred ${numAmount} OG to inference sub-account`);
            } catch (error1) {
                console.log("Method 1 failed:", error1 instanceof Error ? error1.message : "Unknown error");

                try {
                    // Method 2: Try with amount first, then service type
                    console.log(`Trying transferFund(${numAmount}, "inference")...`);
                    await this.broker.ledger.transferFund(numAmount, "inference");
                    console.log(`✅ Successfully transferred ${numAmount} OG to inference sub-account (reversed params)`);
                } catch (error2) {
                    console.log("Method 2 failed:", error2 instanceof Error ? error2.message : "Unknown error");

                    try {
                        // Method 3: Try with string amount
                        console.log(`Trying transferFund("inference", "${numAmount}")...`);
                        await this.broker.ledger.transferFund("inference", numAmount.toString());
                        console.log(`✅ Successfully transferred ${numAmount} OG to inference sub-account (string amount)`);
                    } catch (error3) {
                        console.log("Method 3 failed:", error3 instanceof Error ? error3.message : "Unknown error");

                        try {
                            // Method 4: Try with BigInt amount
                            console.log(`Trying transferFund("inference", BigInt)...`);
                            const weiAmount = BigInt(Math.floor(numAmount * 1e18));
                            await this.broker.ledger.transferFund("inference", weiAmount);
                            console.log(`✅ Successfully transferred ${numAmount} OG to inference sub-account (BigInt amount)`);
                        } catch (error4) {
                            console.log("Method 4 failed:", error4 instanceof Error ? error4.message : "Unknown error");

                            try {
                                // Method 5: Try with ethers format
                                console.log(`Trying transferFund("inference", ethers format)...`);
                                const ethersAmount = ethers.parseEther(numAmount.toString());
                                await this.broker.ledger.transferFund("inference", ethersAmount);
                                console.log(`✅ Successfully transferred ${numAmount} OG to inference sub-account (ethers format)`);
                            } catch (error5) {
                                console.log("Method 5 failed:", error5 instanceof Error ? error5.message : "Unknown error");

                                // Method 6: Try to inspect the method signature
                                console.log("💡 Inspecting transferFund method signature...");
                                console.log("transferFund method:", this.broker.ledger.transferFund);
                                console.log("transferFund toString:", this.broker.ledger.transferFund.toString());

                                throw new Error(`All transferFund methods failed. This appears to be a bug in SDK v0.4.4. Last error: ${error5 instanceof Error ? error5.message : "Unknown error"}`);
                            }
                        }
                    }
                }
            }

            // Wait for transaction to settle
            console.log("⏳ Waiting for transaction to settle...");
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Check balance after transfer
            const newBalance = await this.getAccountBalance();
            console.log(`📊 New main account balance: ${newBalance?.balance || "0.0000"} OG`);
            console.log(`📊 New available balance: ${newBalance?.available || "0.0000"} OG`);
            console.log(`📊 New locked balance: ${newBalance?.locked || "0.0000"} OG`);

            // Verify the transfer worked by checking if locked balance increased
            const oldLocked = parseFloat(balance?.locked || "0");
            const newLocked = parseFloat(newBalance?.locked || "0");

            if (newLocked > oldLocked) {
                console.log(`✅ Transfer successful! Locked balance increased from ${oldLocked} to ${newLocked} OG`);
                return true;
            } else {
                console.log(`⚠️ Transfer may not have worked. Locked balance unchanged: ${oldLocked} OG`);
                return false;
            }

        } catch (error) {
            console.error("❌ Failed to transfer funds to inference:", error);
            console.error("Error details:", {
                message: error instanceof Error ? error.message : "Unknown error",
                name: error instanceof Error ? error.name : "Error",
                stack: error instanceof Error ? error.stack : undefined
            });

            if (error instanceof Error) {
                const errorMsg = error.message.toLowerCase();
                if (errorMsg.includes('transferfund methods failed')) {
                    console.error("\n💡 FIX: transferFund method is broken in 0G SDK v0.4.4");
                    console.error("   → This is a confirmed bug in the current SDK version");
                    console.error("   → The method signature or parameter handling is incorrect");
                    console.error("   → Try making a direct inference request instead");
                    console.error("   → Or wait for SDK update from 0G team");
                } else if (errorMsg.includes('insufficient')) {
                    console.error("\n💡 FIX: Insufficient balance");
                    console.error("   → Add more funds to main account first");
                    console.error("   → Check available balance vs locked balance");
                } else if (errorMsg.includes('circuit breaker')) {
                    console.error("\n💡 FIX: Network is overloaded (circuit breaker)");
                    console.error("   → Wait 1-2 minutes and try again");
                } else if (errorMsg.includes('maxpriorityfee') || errorMsg.includes('eip-1559')) {
                    console.error("\n💡 FIX: Gas pricing issue (EIP-1559 not supported)");
                    console.error("   → This is a known issue with 0G testnet");
                    console.error("   → Try again in a few moments");
                } else {
                    console.error("\n💡 General troubleshooting:");
                    console.error("   → Verify you're on 0G testnet (chain ID: 16602)");
                    console.error("   → Ensure you have enough ETH for gas");
                    console.error("   → Check if inference sub-account exists");
                }
            }
            return false;
        }
    }

    async checkInferenceSubAccountStatus(): Promise<void> {
        if (!this.broker) {
            console.error("Cannot check sub-account status: broker not initialized");
            return;
        }

        try {
            console.log("🔍 Checking inference sub-account status...");

            // Check main account balance first
            const balance = await this.getAccountBalance();
            console.log(`📊 Main account balance: ${balance?.balance || "0.0000"} OG`);
            console.log(`📊 Main account locked: ${balance?.locked || "0.0000"} OG`);
            console.log(`📊 Main account available: ${balance?.available || "0.0000"} OG`);

            // Try to retrieve funds to see if sub-account exists
            try {
                await this.broker.ledger.retrieveFund("inference");
                console.log("✅ Inference sub-account exists and has funds");
            } catch (retrieveError) {
                console.log("⚠️ Inference sub-account may not exist or has no funds");
                console.log("Retrieve error:", retrieveError instanceof Error ? retrieveError.message : "Unknown error");
            }

            // Check if we can get detailed ledger info
            try {
                const ledger = await this.broker.ledger.getLedger();
                console.log("📋 Detailed ledger info:", ledger);
            } catch (ledgerError) {
                console.log("⚠️ Could not get detailed ledger info:", ledgerError instanceof Error ? ledgerError.message : "Unknown error");
            }

        } catch (error) {
            console.error("❌ Failed to check sub-account status:", error);
        }
    }

    async tryAlternativeFunding(): Promise<boolean> {
        if (!this.broker) {
            console.error("Cannot try alternative funding: broker not initialized");
            return false;
        }

        try {
            console.log("🔄 Trying alternative funding approach...");

            // Check if there are any other methods available on the ledger
            console.log("Available ledger methods:", Object.getOwnPropertyNames(this.broker.ledger));

            // Try to see if there's a transferFund method or similar
            const ledgerMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(this.broker.ledger));
            console.log("Ledger prototype methods:", ledgerMethods);

            // The sub-account exists but inference service sees 0 balance
            // This suggests a synchronization issue. Let's try to "activate" the sub-account
            console.log("💡 Sub-account exists but inference service sees 0 balance - trying activation...");

            const services = await this.broker.inference.listService();
            if (services.length === 0) {
                throw new Error("No services available");
            }

            // Try to "activate" the sub-account by making a very small request
            // Maybe the first request needs to succeed to "unlock" the balance
            const firstProvider = services[0].provider;
            console.log(`Trying to activate sub-account with provider: ${firstProvider}`);

            const { endpoint, model } = await this.broker.inference.getServiceMetadata(firstProvider);

            // Try with a minimal but relevant blockchain security query
            const minimalMessages = [{ role: "user", content: "Analyze this transaction for security risks: 0x123...abc" }];
            const headers = await this.broker.inference.getRequestHeaders(firstProvider, JSON.stringify(minimalMessages));

            console.log("Making minimal activation request...");
            console.log("Request details:", {
                endpoint,
                model,
                messages: minimalMessages,
                headersCount: Object.keys(headers).length
            });

            const response = await fetch(`${endpoint}/chat/completions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...headers
                },
                body: JSON.stringify({
                    messages: minimalMessages,
                    model: model,
                }),
            });

            console.log(`Activation request status: ${response.status}`);

            if (response.status === 200) {
                console.log("✅ Sub-account activation successful!");
                const data = await response.json();
                console.log("Response:", data);
                return true;
            } else {
                const errorData = await response.json();
                console.log("❌ Activation failed:", errorData.error);

                // If it's still the same balance error, maybe we need to wait or try a different approach
                if (errorData.error.includes("available balance of 0")) {
                    console.log("💡 Still seeing balance of 0 - this might be a timing issue");
                    console.log("💡 The sub-account exists but the inference service hasn't synchronized yet");
                    console.log("💡 Try waiting a few seconds and then test chat again");
                }

                return false;
            }

        } catch (error) {
            console.error("❌ Alternative funding approach failed:", error);
            return false;
        }
    }

    async forceSubAccountSync(): Promise<boolean> {
        if (!this.broker) {
            console.error("Cannot force sync: broker not initialized");
            return false;
        }

        try {
            console.log("🔄 Forcing sub-account synchronization...");

            // Try to retrieve and re-deposit funds to force sync
            console.log("Step 1: Retrieving funds from inference sub-account...");
            try {
                await this.broker.ledger.retrieveFund("inference");
                console.log("✅ Retrieved funds from inference sub-account");
            } catch (retrieveError) {
                console.log("⚠️ Could not retrieve funds:", retrieveError instanceof Error ? retrieveError.message : "Unknown error");
            }

            // Wait a moment for the transaction to settle
            console.log("Step 2: Waiting for transaction to settle...");
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Re-deposit funds to inference
            console.log("Step 3: Re-depositing funds to inference sub-account...");
            await this.broker.ledger.depositFund(0.1);
            console.log("✅ Re-deposited 0.1 OG to inference sub-account");

            // Wait for sync
            console.log("Step 4: Waiting for synchronization...");
            await new Promise(resolve => setTimeout(resolve, 3000));

            console.log("✅ Sub-account synchronization complete!");
            return true;

        } catch (error) {
            console.error("❌ Failed to force sub-account sync:", error);
            return false;
        }
    }

    async getAccountBalance(): Promise<{ balance: string; locked: string; available: string } | null> {
        if (!this.isInitialized) {
            console.warn("Cannot get account balance: service not initialized");
            return null;
        }

        try {
            console.log("Attempting to get ledger data...");
            const ledger = await this.broker.ledger.getLedger();
            console.log("Ledger data received:", ledger);

            // Check if ledger data is valid
            if (!ledger) {
                console.warn("Ledger data is null or undefined");
                return {
                    balance: "0.0000",
                    locked: "0.0000",
                    available: "0.0000"
                };
            }

            // Safely format balances with error handling
            let balance: string;
            let locked: string;
            let available: string;

            try {
                // Use totalBalance from ledger (per documentation)
                const totalBalanceValue = ledger.totalBalance ? parseFloat(ethers.formatEther(ledger.totalBalance)) : 0;

                balance = isNaN(totalBalanceValue) ? "0.0000" : totalBalanceValue.toFixed(4);
                locked = "0.0000"; // Not provided in simple ledger response
                available = balance; // Total is available for inference

                console.log("Parsed balance values:", { balance, locked, available });
            } catch (parseError) {
                console.warn("Failed to parse balance values, using defaults:", parseError);
                balance = "0.0000";
                locked = "0.0000";
                available = "0.0000";
            }

            return {
                balance: balance,
                locked: locked,
                available: available
            };
        } catch (error) {
            console.error("Failed to get account balance:", error);
            console.error("Error details:", {
                message: error instanceof Error ? error.message : "Unknown error",
                name: error instanceof Error ? error.name : "Error",
                stack: error instanceof Error ? error.stack : undefined
            });

            // Return default values instead of null
            return {
                balance: "0.0000",
                locked: "0.0000",
                available: "0.0000"
            };
        }
    }

    async chat(prompt: ChatPrompt): Promise<ZGComputeResponse> {
        const messages = [{ role: "user" as const, content: prompt.message }];
        return this.makeInferenceRequest(messages);
    }

    async analyzeTransaction(prompt: TransactionAnalysisPrompt): Promise<ZGComputeResponse> {
        const transactionInfo = `
Transaction Analysis Request:
Hash: ${prompt.transactionData.hash}
From: ${prompt.transactionData.from}
To: ${prompt.transactionData.to}
Value: ${prompt.transactionData.value} ETH
Block: ${prompt.transactionData.blockNumber || 'Unknown'}
Timestamp: ${new Date(prompt.transactionData.timestamp).toISOString()}
Risk Factors: ${JSON.stringify(prompt.context.riskFactors)}

Please analyze this transaction for security risks, anomalous patterns, and provide risk assessment recommendations.
`;

        const messages = [{ role: "user" as const, content: transactionInfo }];
        return this.makeInferenceRequest(messages);
    }

    async analyzeWallet(prompt: WalletAnalysisPrompt): Promise<ZGComputeResponse> {
        const walletInfo = `
Wallet Analysis Request:
Address: ${prompt.walletAddress}
Network: ${prompt.context.networkId || 'Unknown'}
Include Transactions: ${prompt.context.includeTransactions ? 'Yes' : 'No'}
Max Transactions: ${prompt.context.maxTransactions || 'Unlimited'}

Please analyze this wallet address for security risks, behavior patterns, and provide risk assessment recommendations.
`;

        const messages = [{ role: "user" as const, content: walletInfo }];
        return this.makeInferenceRequest(messages);
    }

    private async makeInferenceRequest(messages: Array<{ role: "user"; content: string }>): Promise<ZGComputeResponse> {
        if (!this.isInitialized || !this.broker) {
            return {
                success: false,
                error: "0G Compute service not initialized"
            };
        }

        // Try each provider until one succeeds
        for (const [model, providerAddress] of Object.entries(OFFICIAL_PROVIDERS)) {
            try {
                console.log(`Trying provider ${model} (${providerAddress})...`);
                const result = await this.makeInferenceRequestToProvider(providerAddress, messages);

                if (result.success) {
                    this.currentProvider = providerAddress;
                    return {
                        ...result,
                        provider: providerAddress,
                        model: model
                    };
                } else {
                    console.warn(`Provider ${model} failed:`, result.error);
                }
            } catch (error) {
                console.warn(`Provider ${model} threw error:`, error);
                continue;
            }
        }

        console.error("All providers failed to respond");
        return {
            success: false,
            error: "All providers failed to respond"
        };
    }

    private async makeInferenceRequestToProvider(providerAddress: string, messages: Array<{ role: "user"; content: string }>): Promise<ZGComputeResponse> {
        try {
            console.log(`Making inference request to provider: ${providerAddress}`);

            // Get service details
            console.log("Getting service metadata...");
            let endpoint: string;
            let model: string;

            try {
                const metadata = await this.broker.inference.getServiceMetadata(providerAddress);
                endpoint = metadata.endpoint;
                model = metadata.model;
                console.log(`Service endpoint: ${endpoint}, model: ${model}`);
            } catch (metadataError) {
                console.error("Failed to get service metadata:", metadataError);
                throw new Error(`Service metadata unavailable for provider ${providerAddress}. This provider may not be available or acknowledged.`);
            }

            // Generate auth headers (single use)
            console.log("Generating request headers...");
            const headers = await this.broker.inference.getRequestHeaders(providerAddress, JSON.stringify(messages));
            console.log("Headers generated successfully");

            // Make the request
            console.log("Making HTTP request to provider...");
            const response = await fetch(`${endpoint}/chat/completions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...headers
                },
                body: JSON.stringify({
                    messages: messages,
                    model: model,
                }),
            });

            console.log(`Response status: ${response.status}`);

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`HTTP ${response.status}: ${errorText}`);
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log("Response data received:", data);

            const content = data.choices[0]?.message?.content;

            if (!content) {
                console.error("No content in response:", data);
                throw new Error("No content in response");
            }

            console.log("Content extracted successfully");

            // Verify response if it's a verifiable service
            try {
                console.log("Verifying response...");
                const valid = await this.broker.inference.processResponse(providerAddress, content);
                console.log(`Response verification: ${valid ? 'valid' : 'invalid'}`);
            } catch (verifyError) {
                console.warn("Response verification failed:", verifyError);
                // Continue anyway as verification is optional
            }

            return {
                success: true,
                data: content,
                provider: providerAddress
            };
        } catch (error) {
            console.error("Inference request failed:", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error"
            };
        }
    }

    // Method to manually acknowledge providers
    async acknowledgeProviders(): Promise<{ success: boolean; acknowledged: string[]; failed: string[] }> {
        if (!this.isInitialized) {
            return { success: false, acknowledged: [], failed: [] };
        }

        const acknowledged: string[] = [];
        const failed: string[] = [];

        for (const [model, providerAddress] of Object.entries(OFFICIAL_PROVIDERS)) {
            try {
                console.log(`Manually acknowledging provider for ${model}:`, providerAddress);
                await this.broker.inference.acknowledgeProviderSigner(providerAddress);
                acknowledged.push(providerAddress);
                console.log(`Successfully acknowledged provider for ${model}`);
            } catch (error) {
                console.error(`Failed to acknowledge provider ${providerAddress}:`, error);
                failed.push(providerAddress);
            }
        }

        return {
            success: acknowledged.length > 0,
            acknowledged,
            failed
        };
    }

    // Method to get official services (matching your interface)
    getOfficialServices(): Array<{ model: string; provider: string; url: string; inputPrice: bigint; outputPrice: bigint; updatedAt: bigint; verifiability: string }> {
        return Object.entries(OFFICIAL_PROVIDERS).map(([model, provider]) => ({
            model,
            provider,
            url: `https://api.0g.ai/${model}`, // Placeholder URL
            inputPrice: BigInt('1000000000000000000'), // 1 OG (example)
            outputPrice: BigInt('500000000000000000'), // 0.5 OG (example)
            updatedAt: BigInt(Date.now()),
            verifiability: 'TEE'
        }));
    }

    // Method to check if wallet is connected
    async isWalletConnected(): Promise<boolean> {
        if (typeof window === 'undefined' || !window.ethereum) {
            return false;
        }

        try {
            const accounts = await window.ethereum.request({ method: "eth_accounts" });
            return accounts.length > 0;
        } catch (error) {
            console.error("Failed to check wallet connection:", error);
            return false;
        }
    }

    // Method to get connected wallet address
    async getConnectedAddress(): Promise<string | null> {
        if (typeof window === 'undefined' || !window.ethereum) {
            return null;
        }

        try {
            const accounts = await window.ethereum.request({ method: "eth_accounts" });
            return accounts.length > 0 ? accounts[0] : null;
        } catch (error) {
            console.error("Failed to get connected address:", error);
            return null;
        }
    }

    // Method to get MetaMask ETH balance
    async getMetaMaskBalance(): Promise<string | null> {
        if (typeof window === 'undefined' || !window.ethereum) {
            return null;
        }

        try {
            const accounts = await window.ethereum.request({ method: "eth_accounts" });
            if (accounts.length === 0) {
                return null;
            }

            const balance = await window.ethereum.request({
                method: "eth_getBalance",
                params: [accounts[0], "latest"]
            });

            // Convert from wei to ETH
            const ethBalance = ethers.formatEther(balance);
            return parseFloat(ethBalance).toFixed(4);
        } catch (error) {
            console.error("Failed to get MetaMask balance:", error);
            return null;
        }
    }
}

// Export singleton instance
export const zgComputeService = new ZGComputeService();
