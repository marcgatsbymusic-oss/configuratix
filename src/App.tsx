import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Component, type ReactNode } from 'react'
import { AuthProvider } from './hooks/useAuth'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { HomePage } from './pages/HomePage'
import { ProductsPage } from './pages/ProductsPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { ConfiguratorPage } from './pages/ConfiguratorPage'
import { AboutPage } from './pages/AboutPage'
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
          <h1 style={{ color: '#dca95c' }}>MAMMUT</h1>
          <p style={{ color: '#888' }}>Runtime error: {(this.state.error as Error).message}</p>
        </div>
      )
    }
    return this.props.children
  }
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <div className="flex flex-col min-h-screen bg-black">
            <Header />
            <div className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/:slug" element={<ProductDetailPage />} />
                <Route path="/configurator" element={<ConfiguratorPage />} />
                <Route path="/slate-configurator" element={<MainConfigurator />} />
                <Route path="/about/*" element={<AboutPage />} />
                <Route path="/where-to-buy" element={<AboutPage />} />
              </Routes>
            </div>
            <Footer />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
