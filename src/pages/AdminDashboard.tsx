import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { 
  Settings, 
  Play, 
  Users, 
  Coins, 
  Trophy, 
  Calendar, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { LOTTERY_CONFIG } from '../config/lottery'
import { toast } from 'sonner'

interface LotteryStats {
  currentJackpot: string
  totalTicketsSold: number
  totalPlayers: number
  adminBalance: string
  nextDrawTime: string
  lastDrawId: number
}

const AdminDashboard = () => {
  const { address, isConnected } = useAccount()
  const [stats, setStats] = useState<LotteryStats>({
    currentJackpot: '125,000',
    totalTicketsSold: 3891,
    totalPlayers: 1247,
    adminBalance: '3,891',
    nextDrawTime: '2d 14h 32m',
    lastDrawId: 1
  })
  const [loading, setLoading] = useState(false)
  const [drawInProgress, setDrawInProgress] = useState(false)

  const isAdmin = address?.toLowerCase() === LOTTERY_CONFIG.ADMIN_ADDRESS.toLowerCase()

  useEffect(() => {
    if (isConnected && isAdmin) {
      // TODO: Fetch real stats from smart contract
      console.log('Fetching admin stats...')
    }
  }, [isConnected, isAdmin])

  const handleRefreshStats = async () => {
    setLoading(true)
    // TODO: Implement smart contract call to fetch latest stats
    setTimeout(() => {
      setLoading(false)
      toast.success('Stats refreshed')
    }, 1000)
  }

  const handleExecuteDraw = async () => {
    if (!isAdmin) {
      toast.error('Only admin can execute draws')
      return
    }

    setDrawInProgress(true)
    try {
      // TODO: Implement smart contract call to execute draw
      await new Promise(resolve => setTimeout(resolve, 3000)) // Simulate draw execution
      
      toast.success('Draw executed successfully!')
      setStats(prev => ({
        ...prev,
        lastDrawId: prev.lastDrawId + 1,
        currentJackpot: '87,500' // Example new jackpot
      }))
    } catch (error) {
      toast.error('Failed to execute draw')
    } finally {
      setDrawInProgress(false)
    }
  }

  const handleWithdrawFees = async () => {
    if (!isAdmin) {
      toast.error('Only admin can withdraw fees')
      return
    }

    try {
      // TODO: Implement smart contract call to withdraw admin fees
      toast.success('Admin fees withdrawn successfully!')
      setStats(prev => ({ ...prev, adminBalance: '0' }))
    } catch (error) {
      toast.error('Failed to withdraw fees')
    }
  }

  const handleEmergencyPause = async () => {
    if (!isAdmin) {
      toast.error('Only admin can pause the lottery')
      return
    }

    try {
      // TODO: Implement smart contract call to pause lottery
      toast.success('Lottery paused for maintenance')
    } catch (error) {
      toast.error('Failed to pause lottery')
    }
  }

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Connect Your Wallet
        </h2>
        <p className="text-gray-600">
          Please connect your wallet to access the admin dashboard
        </p>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Access Denied
        </h2>
        <p className="text-gray-600">
          You don't have permission to access the admin dashboard
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Admin address: {LOTTERY_CONFIG.ADMIN_ADDRESS}
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Admin Dashboard
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Manage the KasDraw lottery system
        </p>
        
        <button
          onClick={handleRefreshStats}
          disabled={loading}
          className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Stats</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <span className="text-lg font-semibold text-gray-900">Current Jackpot</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {stats.currentJackpot} KAS
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Coins className="w-8 h-8 text-green-500" />
            <span className="text-lg font-semibold text-gray-900">Tickets Sold</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {stats.totalTicketsSold.toLocaleString()}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Users className="w-8 h-8 text-blue-500" />
            <span className="text-lg font-semibold text-gray-900">Total Players</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {stats.totalPlayers.toLocaleString()}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Settings className="w-8 h-8 text-purple-500" />
            <span className="text-lg font-semibold text-gray-900">Admin Balance</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {stats.adminBalance} KAS
          </div>
        </div>
      </div>

      {/* Admin Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Draw Management */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
            <Play className="w-6 h-6" />
            <span>Draw Management</span>
          </h2>
          
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-700">Last Draw ID:</span>
                <span className="text-lg font-bold text-gray-900">#{stats.lastDrawId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Next Draw:</span>
                <span className="text-lg font-bold text-gray-900">{stats.nextDrawTime}</span>
              </div>
            </div>
            
            <button
              onClick={handleExecuteDraw}
              disabled={drawInProgress}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {drawInProgress ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Executing Draw...</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  <span>Execute Draw</span>
                </>
              )}
            </button>
            
            <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-800">Draw Schedule</span>
              </div>
              <p>Draws occur every {LOTTERY_CONFIG.DRAW_DAYS.join(' & ')} at {LOTTERY_CONFIG.DRAW_TIME}</p>
            </div>
          </div>
        </div>

        {/* Financial Management */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
            <Coins className="w-6 h-6" />
            <span>Financial Management</span>
          </h2>
          
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-700">Available Fees:</span>
                <span className="text-lg font-bold text-green-600">{stats.adminBalance} KAS</span>
              </div>
              <div className="text-sm text-gray-600">
                1% of each ticket sale (${LOTTERY_CONFIG.TICKET_PRICE} KAS per ticket)
              </div>
            </div>
            
            <button
              onClick={handleWithdrawFees}
              disabled={stats.adminBalance === '0'}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Coins className="w-5 h-5" />
              <span>Withdraw Admin Fees</span>
            </button>
            
            <div className="text-sm text-gray-600 bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-800">Fee Structure</span>
              </div>
              <p>Admin receives 1% of all ticket sales for platform maintenance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Controls */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          <span>Emergency Controls</span>
        </h2>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="font-semibold text-red-800">Caution: Emergency Functions</span>
          </div>
          <p className="text-sm text-red-700 mb-4">
            These functions should only be used in case of emergencies or maintenance.
          </p>
          
          <button
            onClick={handleEmergencyPause}
            className="px-6 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
          >
            Emergency Pause
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard