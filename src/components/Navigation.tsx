import { Link, useLocation } from 'react-router-dom'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { Ticket, Home, Trophy, User, Settings } from 'lucide-react'
import { ADMIN_ADDRESS } from '../config/lottery'

const Navigation = () => {
  const location = useLocation()
  const { address } = useAccount()
  const isAdmin = address?.toLowerCase() === ADMIN_ADDRESS.toLowerCase()

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/play', label: 'Play', icon: Ticket },
    { path: '/results', label: 'Results', icon: Trophy },
    { path: '/my-tickets', label: 'My Tickets', icon: User },
  ]

  if (isAdmin) {
    navItems.push({ path: '/admin', label: 'Admin', icon: Settings })
  }

  return (
    <nav className="bg-white shadow-lg border-b-2 border-cyan-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
              <Ticket className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              KasDraw
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-8">
            {navItems.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-cyan-100 text-cyan-700'
                      : 'text-gray-600 hover:text-cyan-600 hover:bg-cyan-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </Link>
              )
            })}
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            <ConnectButton />
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <div className="flex space-x-4 overflow-x-auto">
            {navItems.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-cyan-100 text-cyan-700'
                      : 'text-gray-600 hover:text-cyan-600 hover:bg-cyan-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation