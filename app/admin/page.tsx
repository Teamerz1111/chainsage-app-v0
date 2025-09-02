import { ProtectedRoute } from "@/components/protected-route"
import { AdminDashboard } from "@/components/admin-dashboard"

export default function AdminPage() {
  return (
    <ProtectedRoute title="0g-Sygna Admin" description="Manage your blockchain monitoring preferences and watchlists">
      <AdminDashboard />
    </ProtectedRoute>
  )
}
