import dynamic from 'next/dynamic'
import { WalletProvider } from "@/contexts/wallet-context"

const ZGComputeIntegration = dynamic(() => import('@/components/zg-compute-integration').then(mod => ({ default: mod.ZGComputeIntegration })), {
  loading: () => <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>,
  ssr: false
})

export default function TestPage() {
    return (
        <WalletProvider>
            <div className="min-h-screen bg-gradient-to-br from-cyber-dark via-gray-900 to-black">
                <ZGComputeIntegration />
            </div>
        </WalletProvider>
    )
}
