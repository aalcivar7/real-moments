import { useApp } from './context/AppContext'
import { AuthScreen } from './components/auth/AuthScreen'
import { BottomNav } from './components/layout/BottomNav'
import { Dashboard } from './components/dashboard/Dashboard'
import { MontajesTab } from './components/montajes/MontajesTab'
import { FinancialTab } from './components/financial/FinancialTab'
import { InventoryTab } from './components/inventory/InventoryTab'

const TABS = [Dashboard, MontajesTab, FinancialTab, InventoryTab]

export const App = () => {
  const { state, loading } = useApp()

  if (loading) return (
    <div className="min-h-screen bg-off-white dark:bg-neutral-950 flex items-center justify-center">
      <p className="font-title text-2xl text-forest dark:text-sage animate-pulse">Real Moments</p>
    </div>
  )

  if (!state.currentUser) return <AuthScreen />

  const ActiveTab = TABS[state.activeTab] ?? Dashboard

  return (
    <div className="min-h-screen bg-off-white dark:bg-neutral-950 max-w-lg mx-auto relative">
      <main className="overflow-y-auto">
        <ActiveTab />
      </main>
      <BottomNav />
    </div>
  )
}
