import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import Home from './pages/Home'
import Play from './pages/Play'
import Results from './pages/Results'
import MyTickets from './pages/MyTickets'
import AdminDashboard from './pages/AdminDashboard'
import Navigation from './components/Navigation'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/play" element={<Play />} />
            <Route path="/results" element={<Results />} />
            <Route path="/my-tickets" element={<MyTickets />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
