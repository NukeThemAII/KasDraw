import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Suspense, Component, ReactNode } from 'react'
import HomeV2 from './pages/HomeV2'
import PlayV2 from './pages/PlayV2'
import Draw from './pages/Draw'
import ResultsV2 from './pages/ResultsV2'
import MyTickets from './pages/MyTickets'
import AdminDashboard from './pages/AdminDashboard'
import Navigation from './components/Navigation'
import { Loader2 } from 'lucide-react'

// Error Boundary Component to catch and handle errors
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('App Error Boundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
          <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-4">The page encountered an error. Please refresh to try again.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Loading Component for route transitions
const PageLoader = () => (
  <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 flex items-center justify-center">
    <div className="text-center">
      <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
      <p className="text-gray-600 text-lg">Loading...</p>
    </div>
  </div>
)

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50">
          <Navigation />
          <main className="container mx-auto px-4 py-8">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<HomeV2 />} />
                <Route path="/play" element={<PlayV2 />} />
                <Route path="/draw" element={<Draw />} />
                <Route path="/results" element={<ResultsV2 />} />
                <Route path="/my-tickets" element={<MyTickets />} />
                <Route path="/admin" element={<AdminDashboard />} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
