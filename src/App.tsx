import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Component, type ReactNode } from 'react'
import { AuthProvider } from './hooks/useAuth'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { HomePage } from './pages/HomePage'
import { ProductsPage } from './pages/ProductsPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { AboutPage } from './pages/AboutPage'
import { OutletPage } from './pages/OutletPage'
import { ShopPage } from './pages/ShopPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { DoorSimPage } from './pages/DoorSimPage'
import { AddonsPage } from './pages/AddonsPage'
import { IntelligentHome } from './pages/IntelligentHome'
import { InspirationsPage } from './pages/InspirationsPage'
import { PvcWindowsPage } from './pages/PvcWindowsPage'
import { AluminiumWindowsPage } from './pages/AluminiumWindowsPage'
import { CookieConsentModal } from './components/common/CookieConsentModal'
import { CookieConsentBadge } from './components/common/CookieConsentBadge'
import { SiteMapPage } from './pages/SiteMapPage'
import { WhereToBuyPage } from './pages/WhereToBuyPage'
import { CartDrawer } from './components/Shop/CartDrawer'
import { MainConfigurator } from './components/SlateConfigurator/MainConfigurator'
import { ConfiguratorTestPage } from './pages/ConfiguratorTestPage'
import './index.css'

// Error boundary to catch silent crashes in the component tree
class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null }
  static getDerivedStateFromError(error: Error) {
    return { error }
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ color: 'white', padding: '40px', fontFamily: 'Montserrat, sans-serif' }}>
          <h1 style={{ color: '#eab676' }}>MAMMUT</h1>
          <p style={{ color: '#888' }}>Runtime error: {(this.state.error as Error).message}</p>
        </div>
      )
    }
    return this.props.children
  }
}

import { AdminLayout } from './components/admin/AdminLayout'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { SetupOverview } from './pages/admin/SetupOverview'
import { PricingManager } from './pages/admin/PricingManager'
import { MatrixUploader } from './pages/admin/MatrixUploader'
import { QuotationsPage } from './pages/admin/QuotationsPage'
import { QuotationDetailPage } from './pages/admin/QuotationDetailPage'
import { FactoryQueuePage } from './pages/admin/FactoryQueuePage'
import { LogisticsPipeline } from './pages/admin/LogisticsPipeline'
import { SalesNetwork } from './pages/admin/SalesNetwork'
import { InstallerDashboard } from './pages/installer/InstallerDashboard'

import { DebugPricing } from './pages/DebugPricing'

import { PartnerLayout } from './components/partner/PartnerLayout'
import { PartnerDashboard } from './pages/partner/PartnerDashboard'
import { PartnerLeads } from './pages/partner/PartnerLeads'
import { PartnerProfile } from './pages/partner/PartnerProfile'
import { PartnerLanding } from './pages/partner/PartnerLanding'

function StorefrontLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-mammut-black">
      <Header />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/pvc-windows" element={<PvcWindowsPage />} />
          <Route path="/products/windows/pvc" element={<PvcWindowsPage />} />
          <Route path="/products/aluminium-windows" element={<AluminiumWindowsPage />} />
          <Route path="/products/windows/aluminium" element={<AluminiumWindowsPage />} />
          <Route path="/products/windows/aluminum" element={<AluminiumWindowsPage />} />
          <Route path="/products/:slug" element={<ProductDetailPage />} />
          <Route path="/outlet" element={<OutletPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/configurator" element={<MainConfigurator />} />
          <Route path="/slate-configurator" element={<MainConfigurator />} />
          <Route path="/configurator-test" element={<ConfiguratorTestPage />} />
          <Route path="/about/*" element={<AboutPage />} />
          <Route path="/where-to-buy" element={<WhereToBuyPage />} />
          <Route path="/debug-pricing" element={<DebugPricing />} />
          <Route path="/doorsim" element={<DoorSimPage />} />
          <Route path="/products/addons/type/:id" element={<AddonsPage />} />
          <Route path="/inteligentny-dom" element={<IntelligentHome />} />
          <Route path="/inspiration" element={<InspirationsPage />} />
          <Route path="/inspiration/:category" element={<InspirationsPage />} />
          <Route path="/sitemap" element={<SiteMapPage />} />
        </Routes>
      </div>
      <CartDrawer />
      <Footer />
      <CookieConsentModal />
      <CookieConsentBadge />
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Admin Dashboard Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="network" element={<SalesNetwork />} />
              <Route path="logistics" element={<LogisticsPipeline />} />
              <Route path="quotations" element={<QuotationsPage />} />
              <Route path="quotations/:id" element={<QuotationDetailPage />} />
              <Route path="factory" element={<FactoryQueuePage />} />
              <Route path="setup" element={<SetupOverview />} />
              <Route path="pricing" element={<PricingManager />} />
              <Route path="upload" element={<MatrixUploader />} />
            </Route>

            {/* Installer Field App */}
            <Route path="/installer" element={<InstallerDashboard />} />

            {/* Partner Portal Routes */}
            <Route path="/partner" element={<PartnerLayout />}>
              <Route index element={<PartnerDashboard />} />
              <Route path="leads" element={<PartnerLeads />} />
              <Route path="profile" element={<PartnerProfile />} />
            </Route>
            {/* Partner Landing Page (Dummy) */}
            <Route path="/landing/:partnerId" element={<PartnerLanding />} />
            
            {/* Public Storefront Routes */}
            <Route path="*" element={<StorefrontLayout />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
