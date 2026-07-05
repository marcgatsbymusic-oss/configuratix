import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
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
import { StagingPage } from './pages/StagingPage'
import { PdfImportPage } from './pages/PdfImportPage'
import { MainConfigurator } from './components/SlateConfigurator/MainConfigurator'
import { ConfiguratorTestPage } from './pages/ConfiguratorTestPage'
import { ArPage } from './pages/ArPage'
import { ViewerOnly } from './pages/ViewerOnly'
import { F1XXTPage } from './pages/F1XXTPage'
import { F1XXXPage } from './pages/F1XXXPage'
import { F2MPXPage } from './pages/F2MPXPage'
import { FrameOnlyTesterPage } from './pages/FrameOnlyTesterPage'
import { HingeTesterPage } from './pages/HingeTesterPage'
import { F202LPage } from './pages/F202LPage'
import { F202Lv2Page } from './pages/F202Lv2Page'
import { F202RFixV2Page } from './pages/F202RFixV2Page'
import { F202RV3Page } from './pages/F202RV3Page'
import { F202RPage } from './pages/F202RPage'
import { F104ProfileInspectorPage } from './pages/F104ProfileInspectorPage'
import { RollerBlindTestPage } from './pages/RollerBlindTestPage'
import { RollerBlindTestMosquitoPage } from './pages/RollerBlindTestMosquitoPage'
import { BBox225MosquitoPage } from './pages/BBox225MosquitoPage'
import { IGLSideTestBuildPage } from './pages/IGLSideTestBuildPage'
import { GarageDoorSimPage } from './pages/GarageDoorSimPage'
import { MovableMullionTestPage } from './pages/MovableMullionTestPage'
import { Iglo5F202Page } from './pages/Iglo5F202Page'
import { Iglo5FixedPage } from './pages/Iglo5FixedPage'
import { F202Page } from './pages/F202Page'
import { Zlozenie07Page } from './pages/Zlozenie07Page'
import { SingleFixedBottomPage } from './pages/SingleFixedBottomPage'
import { F252TestPage } from './pages/F252TestPage'
import F252V204072026Page from './pages/F252V204072026Page'
import IG5_F252_TestPage from './pages/IG5_F252_TestPage'
import IG5_F104_TestPage from './pages/IG5_F104_TestPage'
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
        <div style={{ color: 'white', backgroundColor: 'black', padding: '40px', fontFamily: 'Montserrat, sans-serif', minHeight: '100vh' }}>
          <h1 style={{ color: '#eab676' }}>MAMMUT</h1>
          <p style={{ color: '#ff8888' }}>Runtime error: {(this.state.error as Error).message}</p>
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
  const location = useLocation();
  const isDebugConfigurator = location.pathname === '/configurator-test';
  const isDebugPricing = location.pathname === '/debug-pricing';

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
          <Route path="/products/garage-doors" element={<GarageDoorSimPage />} />
          <Route path="/garage-door-sim" element={<GarageDoorSimPage />} />
          <Route path="/products/addons/type/:id" element={<AddonsPage />} />
          <Route path="/inteligentny-dom" element={<IntelligentHome />} />
          <Route path="/inspiration" element={<InspirationsPage />} />
          <Route path="/inspiration/:category" element={<InspirationsPage />} />
          <Route path="/sitemap" element={<SiteMapPage />} />
          <Route path="/staging" element={<StagingPage />} />
          <Route path="/pilartest" element={<StagingPage presetSlug="pilartest" />} />
          <Route path="/import" element={<PdfImportPage />} />
        </Routes>
      </div>
      <CartDrawer />
      {!isDebugConfigurator && (
        isDebugPricing ? (
          <div className="hidden md:block">
            <Footer minimal />
          </div>
        ) : (
          <Footer />
        )
      )}
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
            
            {/* AR Preview – full screen, no header/footer */}
            <Route path="/ar-preview" element={<ArPage />} />

            {/* 3D Viewer Only – full screen, no header/footer */}
            <Route path="/viewer" element={<ViewerOnly />} />

            {/* F1XXT Fixed Window Viewer – full screen, no header/footer */}
            <Route path="/f1xxt" element={<F1XXTPage />} />

            {/* F1XXX Tilt & Turn Window Viewer – full screen, no header/footer */}
            <Route path="/f1xxx" element={<F1XXXPage />} />

            {/* F2MPX Movable Post Double Window – full screen, no header/footer */}
            <Route path="/f2mpx" element={<F2MPXPage />} />

            {/* Standalone test viewer for outer IGE frame build */}
            <Route path="/frame-only-tester" element={<FrameOnlyTesterPage />} />

            {/* IGE_F202L Double Window Test Page */}
            <Route path="/f202l" element={<F202LPage />} />

            {/* IGE_F202Lv2 Double Window (Left Active) Test Page */}
            <Route path="/f202lv2" element={<F202Lv2Page />} />

            {/* IGE_F202_R_FIXV2 Double Window (Left Active, CW Handle, V8 Post) */}
            <Route path="/f202rfixv2" element={<F202RFixV2Page />} />

            {/* IGE_DW_PST_LEFT_TT-T Double Window F202RV3 */}
            <Route path="/f202rv3" element={<F202RV3Page />} />

            {/* IGE Double Window Active Right F202R */}
            <Route path="/f202r" element={<F202RPage />} />

            {/* Hinge Rotation & Rigging Tester */}
            <Route path="/hinge-tester" element={<HingeTesterPage />} />

            {/* F104 Solid Block Profile Inspector */}
            <Route path="/f104-profile" element={<F104ProfileInspectorPage />} />

            {/* Roller Blind Casing Tester */}
            <Route path="/roller-blind-test" element={<RollerBlindTestPage />} />

            {/* Roller Blind Casing + Mosquito Net Tester */}
            <Route path="/roller-blind-test-mosquito" element={<RollerBlindTestMosquitoPage />} />

            {/* Standalone Parametric Blind Box 225 + Mosquito Viewer */}
            <Route path="/bbox-225-mosquito" element={<BBox225MosquitoPage />} />

            {/* IGLSIDE_TEST_BUILD Sliding Door Test Page */}
            <Route path="/igls-test-build" element={<IGLSideTestBuildPage />} />

            {/* Movable Mullion Test Page */}
            <Route path="/movable-mullion-test" element={<MovableMullionTestPage />} />

            {/* IGLO 5 · F202 — Okno 2 kw. słupek ruchomy */}
            <Route path="/iglo5-f202" element={<Iglo5F202Page />} />

            {/* IGLO 5 · F202 — seed v2 (saturday_27_14_37, new canonical profiles.json) */}
            <Route path="/f202" element={<F202Page />} />

            {/* IGLO 5 · F1T0 — Okno stałe (fixed frame) */}
            <Route path="/iglo5-fixed" element={<Iglo5FixedPage />} />

            {/* Złożenie 07 Preview */}
            <Route path="/preview/zlozenie-07-final" element={<Zlozenie07Page />} />

            <Route path="/preview/zlozenie07" element={<Zlozenie07Page />} />
            <Route path="/preview/single-fixed-bottom" element={<SingleFixedBottomPage />} />

            {/* F252 Previews */}
            <Route path="/test/f252" element={<F252TestPage />} />
            <Route path="/debug-pricing/f252-test" element={<F252TestPage />} />
            <Route path="/f252-v2" element={<F252V204072026Page />} />

            {/* IG5-F252 Test Page */}
            <Route path="/test/ig5-f252" element={<IG5_F252_TestPage />} />

            {/* IG5-F104 Test Page */}
            <Route path="/test/ig5-f104" element={<IG5_F104_TestPage />} />

            {/* Public Storefront Routes */}
            <Route path="*" element={<StorefrontLayout />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
