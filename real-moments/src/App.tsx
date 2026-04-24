import { useApp } from './context/AppContext'
import { AuthScreen } from './components/auth/AuthScreen'
import { BottomNav } from './components/layout/BottomNav'
import { Dashboard } from './components/dashboard/Dashboard'
import { MontajesTab } from './components/montajes/MontajesTab'
import { FinancialTab } from './components/financial/FinancialTab'
import { InventoryTab } from './components/inventory/InventoryTab'

const TABS = [Dashboard, MontajesTab, FinancialTab, InventoryTab]

export const App = () => {
  const { state, loading, syncError, clearSyncError } = useApp()

  if (loading) return (
    <div className="min-h-screen bg-off-white dark:bg-neutral-950 flex items-center justify-center">
      <p className="font-title text-2xl text-forest dark:text-sage animate-pulse">Real Moments</p>
    </div>
  )

  if (!state.currentUser) return <AuthScreen />

  const ActiveTab = TABS[state.activeTab] ?? Dashboard

  return (
    <div className="min-h-screen bg-off-white dark:bg-neutral-950 max-w-lg mx-auto relative">
      {syncError && (
        <div className="fixed top-4 left-4 right-4 z-50 bg-red-500 text-white text-xs rounded-xl px-4 py-3 shadow-lg flex items-center justify-between max-w-lg mx-auto">
          <span>{syncError}</span>
          <button onClick={clearSyncError} className="ml-3 font-bold text-sm leading-none">✕</button>
        </div>
      )}
      <main className="overflow-y-auto">
        <ActiveTab />
      </main>
      <BottomNav />
    </div>
  )
}
