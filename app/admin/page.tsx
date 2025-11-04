import dynamic from 'next/dynamic'
import { ProtectedRoute } from "@/components/protected-route"

const AdminDashboard = dynamic(() => import('@/components/admin-dashboard').then(mod => ({ default: mod.AdminDashboard })), {
  loading: () => <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>,
  ssr: false
})

export default function AdminPage() {
  return (
    <ProtectedRoute title="0g-Sygna Admin" description="Manage your blockchain monitoring preferences and watchlists">
      <AdminDashboard />
    </ProtectedRoute>
  )
}
