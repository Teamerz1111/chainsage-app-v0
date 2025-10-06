import { ZGComputeIntegration } from "@/components/zg-compute-integration"
import { WalletProvider } from "@/contexts/wallet-context"

export default function TestPage() {
    return (
        <WalletProvider>
            <div className="min-h-screen bg-gradient-to-br from-cyber-dark via-gray-900 to-black">
                <ZGComputeIntegration />
            </div>
        </WalletProvider>
    )
}
