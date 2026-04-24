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
import { CartDrawer } from './components/Shop/CartDrawer'
import { MainConfigurator } from './components/SlateConfigurator/MainConfigurator'
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

import { DebugPricing } from './pages/DebugPricing'

import { PartnerLayout } from './components/partner/PartnerLayout'
import { PartnerDashboard } from './pages/partner/PartnerDashboard'
import { PartnerLeads } from './pages/partner/PartnerLeads'
import { PartnerProfile } from './pages/partner/PartnerProfile'

function StorefrontLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-black">
      <Header />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:slug" element={<ProductDetailPage />} />
          <Route path="/outlet" element={<OutletPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/configurator" element={<MainConfigurator />} />
          <Route path="/slate-configurator" element={<MainConfigurator />} />
          <Route path="/about/*" element={<AboutPage />} />
          <Route path="/where-to-buy" element={<AboutPage />} />
          <Route path="/debug-pricing" element={<DebugPricing />} />
        </Routes>
      </div>
      <CartDrawer />
      <Footer />
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
              <Route path="quotations" element={<QuotationsPage />} />
              <Route path="quotations/:id" element={<QuotationDetailPage />} />
              <Route path="factory" element={<FactoryQueuePage />} />
              <Route path="setup" element={<SetupOverview />} />
              <Route path="pricing" element={<PricingManager />} />
              <Route path="upload" element={<MatrixUploader />} />
            </Route>

            {/* Partner Portal Routes */}
            <Route path="/partner" element={<PartnerLayout />}>
              <Route index element={<PartnerDashboard />} />
              <Route path="leads" element={<PartnerLeads />} />
              <Route path="profile" element={<PartnerProfile />} />
            </Route>
            
            {/* Public Storefront Routes */}
            <Route path="*" element={<StorefrontLayout />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
