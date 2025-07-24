import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { 
  Settings, 
  Play, 
  Coins, 
  Trophy, 
  Calendar, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  Loader2,
  RotateCcw
} from 'lucide-react'
import { ADMIN_ADDRESS } from '../config/lottery'
import { useLotteryContract } from '../hooks/useLotteryContract'
import { toast } from 'sonner'



const AdminDashboard = () => {
  const { address, isConnected } = useAccount()
  const { 
    lotteryState, 
    refetchLotteryState, 
    executeDrawAuto, 
    withdrawAdminFees, 
    emergencyRefundAll,
    isExecutingDraw, 
    isWithdrawing,
    isRefunding
  } = useLotteryContract()
  const [loading, setLoading] = useState(false)

  const isAdmin = address?.toLowerCase() === ADMIN_ADDRESS.toLowerCase()

  useEffect(() => {
    if (isConnected && isAdmin) {
      // TODO: Fetch real stats from smart contract
      console.log('Fetching admin stats...')
    }
  }, [isConnected, isAdmin])

  const handleRefreshStats = async () => {
    setLoading(true)
    try {
      await refetchLotteryState()
      toast.success('Stats refreshed')
    } catch {
      toast.error('Failed to refresh stats')
    } finally {
      setLoading(false)
    }
  }

  const handleExecuteDraw = async () => {
    if (!isAdmin) {
      toast.error('Only admin can execute draws')
      return
    }

    try {
      await executeDrawAuto()
      toast.success('Draw executed successfully!')
      await refetchLotteryState()
    } catch (error) {
      console.error('Draw execution failed:', error)
      toast.error('Failed to execute draw')
    }
  }

  const handleWithdrawFees = async () => {
    if (!isAdmin) {
      toast.error('Only admin can withdraw fees')
      return
    }

    try {
      await withdrawAdminFees()
      toast.success('Admin fees withdrawn successfully!')
      await refetchLotteryState()
    } catch (error) {
      console.error('Withdrawal failed:', error)
      toast.error('Failed to withdraw fees')
    }
  }

  const handleEmergencyRefund = async () => {
    if (!isAdmin) {
      toast.error('Only admin can execute emergency refund')
      return
    }

    const confirmed = window.confirm(
      'Are you sure you want to refund all player deposits? This action cannot be undone and will return all KAS to the original depositing addresses.'
    )

    if (!confirmed) return

    try {
      await emergencyRefundAll()
      toast.success('Emergency refund executed successfully!')
      await refetchLotteryState()
    } catch (error) {
      console.error('Emergency refund failed:', error)
      toast.error('Failed to execute emergency refund')
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
          Admin address: {ADMIN_ADDRESS}
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
            {lotteryState?.accumulatedJackpot || '0'} KAS
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Coins className="w-8 h-8 text-green-500" />
            <span className="text-lg font-semibold text-gray-900">Tickets Sold</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {lotteryState?.totalTicketsSold?.toLocaleString() || '0'}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Calendar className="w-8 h-8 text-blue-500" />
            <span className="text-lg font-semibold text-gray-900">Current Draw</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            #{lotteryState?.currentDrawId || '0'}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Settings className="w-8 h-8 text-purple-500" />
            <span className="text-lg font-semibold text-gray-900">Admin Balance</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {lotteryState?.adminBalance || '0'} KAS
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <RotateCcw className="w-6 h-6 text-red-500" />
            <span>Emergency Refund</span>
          </h3>
          <p className="text-gray-600 mb-4">
            Refund all player deposits back to their original addresses. Use only for testnet recovery or emergency situations.
          </p>
          <button
            onClick={handleEmergencyRefund}
            disabled={isRefunding}
            className="w-full py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg font-semibold hover:from-red-600 hover:to-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isRefunding ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing Refund...</span>
              </>
            ) : (
              <>
                <RotateCcw className="w-5 h-5" />
                <span>Emergency Refund All</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Admin Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <Play className="w-6 h-6 text-green-500" />
            <span>Execute Draw</span>
          </h3>
          <p className="text-gray-600 mb-4">
            Execute the lottery draw to generate winning numbers and distribute prizes.
          </p>
          <button
            onClick={handleExecuteDraw}
            disabled={isExecutingDraw || lotteryState?.paused}
            className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isExecutingDraw ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Executing Draw...</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                <span>Execute Draw</span>
              </>
            )}
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <Coins className="w-6 h-6 text-blue-500" />
            <span>Withdraw Fees</span>
          </h3>
          <p className="text-gray-600 mb-4">
            Withdraw accumulated admin fees from the lottery contract.
          </p>
          <button
            onClick={handleWithdrawFees}
            disabled={isWithdrawing || !lotteryState?.adminBalance || parseFloat(lotteryState.adminBalance) === 0}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isWithdrawing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Withdrawing...</span>
              </>
            ) : (
              <>
                <Coins className="w-5 h-5" />
                <span>Withdraw {lotteryState?.adminBalance || '0'} KAS</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Lottery Status */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <CheckCircle className="w-6 h-6 text-green-500" />
          <span>Lottery Status</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600">Contract Status:</span>
            <span className={`font-semibold ${
              lotteryState?.paused ? 'text-red-600' : 'text-green-600'
            }`}>
              {lotteryState?.paused ? 'Paused' : 'Active'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600">Current Draw ID:</span>
            <span className="font-semibold text-gray-900">
              #{lotteryState?.currentDrawId || '0'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard