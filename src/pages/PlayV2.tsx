import React, { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Wallet, Clock, Trophy, Zap, AlertCircle, CheckCircle } from 'lucide-react'
import NumberSelectorV2 from '../components/NumberSelectorV2'
import { useLotteryContractV2 } from '../hooks/useLotteryContractV2'
import { toast } from 'sonner'

const PlayV2: React.FC = () => {
  const { address: account, isConnected } = useAccount()
  const {
    lotteryStats,
    drawExecutionInfo,
    playerStats,
    isPaused,
    isLoading,
    isPurchasing,
    purchaseError,
    purchaseTickets,
    refreshAllData
  } = useLotteryContractV2()

  const [selectedTickets, setSelectedTickets] = useState<number[][]>([])
  const [isConfirming, setIsConfirming] = useState(false)
  const [countdown, setCountdown] = useState('')

  // Update countdown timer
  useEffect(() => {
    if (!drawExecutionInfo) return

    const updateCountdown = () => {
      const now = Math.floor(Date.now() / 1000)
      const timeRemaining = drawExecutionInfo.timeRemaining

      if (timeRemaining <= 0) {
        setCountdown('Draw available now!')
        return
      }

      const days = Math.floor(timeRemaining / (24 * 60 * 60))
      const hours = Math.floor((timeRemaining % (24 * 60 * 60)) / (60 * 60))
      const minutes = Math.floor((timeRemaining % (60 * 60)) / 60)
      const seconds = timeRemaining % 60

      if (days > 0) {
        setCountdown(`${days}d ${hours}h ${minutes}m`)
      } else if (hours > 0) {
        setCountdown(`${hours}h ${minutes}m ${seconds}s`)
      } else {
        setCountdown(`${minutes}m ${seconds}s`)
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [drawExecutionInfo])

  // Handle ticket purchase
  const handlePurchase = async () => {
    if (!selectedTickets.length) {
      toast.error('Please select at least one complete ticket')
      return
    }

    setIsConfirming(true)
    
    try {
      const success = await purchaseTickets(selectedTickets)
      if (success) {
        setSelectedTickets([])
        // Refresh data after successful purchase
        setTimeout(() => {
          refreshAllData()
        }, 2000)
      }
    } catch (error) {
      console.error('Purchase failed:', error)
    } finally {
      setIsConfirming(false)
    }
  }

  const totalCost = selectedTickets.length * 10
  const canPurchase = isConnected && selectedTickets.length > 0 && !isPaused && !isPurchasing && !isConfirming

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center py-12">
          <div className="animate-spin w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Loading lottery data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center py-8">
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent mb-4">
          Play BlockDAG Lottery
        </h1>
        <p className="text-xl text-slate-600 mb-2">
          Pick 5 numbers from 1-35 and win big!
        </p>
        <p className="text-sm text-cyan-600">
          Enhanced odds • Multiple prize tiers • Instant finality
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Current Jackpot */}
        <div className="bg-gradient-to-br from-emerald-400 via-cyan-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center space-x-3 mb-4">
            <Trophy className="w-8 h-8 text-yellow-300" />
            <span className="text-lg font-semibold">Current Jackpot</span>
          </div>
          <div className="text-3xl font-bold mb-2">
            {lotteryStats?.currentJackpot || '0'} KAS
          </div>
          <div className="text-sm opacity-90">
            ≈ ${((parseFloat(lotteryStats?.currentJackpot || '0')) * 0.15).toFixed(2)} USD
          </div>
        </div>

        {/* Next Draw */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Clock className="w-8 h-8 text-cyan-500" />
            <span className="text-lg font-semibold text-slate-900">Next Draw</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mb-2">
            {countdown}
          </div>
          <div className="text-sm text-slate-600">
            {lotteryStats?.ticketsSoldThisDraw || 0} tickets sold
          </div>
        </div>

        {/* Your Stats */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Wallet className="w-8 h-8 text-purple-500" />
            <span className="text-lg font-semibold text-slate-900">Your Stats</span>
          </div>
          {isConnected ? (
            <>
              <div className="text-2xl font-bold text-slate-900 mb-2">
                {playerStats?.totalTickets || 0} tickets
              </div>
              <div className="text-sm text-slate-600">
                {playerStats?.totalWinnings || '0'} KAS won
              </div>
            </>
          ) : (
            <div className="text-slate-500">
              Connect wallet to view stats
            </div>
          )}
        </div>
      </div>

      {/* Alerts */}
      {isPaused && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-red-800">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Lottery is currently paused</span>
          </div>
          <p className="text-sm text-red-600 mt-1">
            Ticket purchases are temporarily disabled. Please check back later.
          </p>
        </div>
      )}

      {!isConnected && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <Wallet className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Connect Your Wallet
          </h3>
          <p className="text-blue-700 mb-4">
            Connect your wallet to purchase lottery tickets and participate in the BlockDAG lottery.
          </p>
          <ConnectButton />
        </div>
      )}

      {/* Number Selector */}
      {isConnected && !isPaused && (
        <NumberSelectorV2
          onTicketsChange={setSelectedTickets}
          maxTickets={10}
          disabled={isPurchasing || isConfirming}
        />
      )}

      {/* Purchase Section */}
      {isConnected && !isPaused && selectedTickets.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-slate-900 mb-4">
            Purchase Summary
          </h3>
          
          {/* Ticket Preview */}
          <div className="space-y-3 mb-6">
            {selectedTickets.map((ticket, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 bg-slate-50 rounded-lg">
                <span className="font-medium text-slate-700">
                  Ticket {index + 1}:
                </span>
                <div className="flex space-x-2">
                  {ticket.map((number, numIndex) => (
                    <div
                      key={numIndex}
                      className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg flex items-center justify-center text-sm font-bold"
                    >
                      {number}
                    </div>
                  ))}
                </div>
                <span className="ml-auto text-cyan-600 font-medium">
                  10 KAS
                </span>
              </div>
            ))}
          </div>

          {/* Total Cost */}
          <div className="bg-gradient-to-r from-cyan-50 to-teal-50 rounded-lg p-4 border border-cyan-200 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-slate-900">
                  Total Cost: {selectedTickets.length} ticket{selectedTickets.length !== 1 ? 's' : ''}
                </div>
                <div className="text-sm text-slate-600">
                  Each ticket: 10 KAS
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-cyan-600">
                  {totalCost} KAS
                </div>
                <div className="text-sm text-slate-500">
                  ≈ ${(totalCost * 0.15).toFixed(2)} USD
                </div>
              </div>
            </div>
          </div>

          {/* Purchase Button */}
          <button
            onClick={handlePurchase}
            disabled={!canPurchase}
            className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all transform ${
              canPurchase
                ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white hover:from-cyan-600 hover:to-teal-600 hover:scale-105 shadow-lg'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isPurchasing || isConfirming ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                <span>
                  {isPurchasing ? 'Processing Purchase...' : 'Confirming...'}
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Zap className="w-5 h-5" />
                <span>Purchase {selectedTickets.length} Ticket{selectedTickets.length !== 1 ? 's' : ''}</span>
              </div>
            )}
          </button>

          {/* Error Display */}
          {purchaseError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2 text-red-800">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Purchase failed</span>
              </div>
              <p className="text-xs text-red-600 mt-1">
                {purchaseError.message || 'An error occurred during purchase'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Prize Structure */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-4">
          Prize Structure
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-4 text-white text-center">
            <div className="text-2xl font-bold mb-2">50%</div>
            <div className="text-sm font-medium">Jackpot</div>
            <div className="text-xs opacity-90">5 matches</div>
          </div>
          
          <div className="bg-gradient-to-r from-cyan-400 to-teal-500 rounded-lg p-4 text-white text-center">
            <div className="text-2xl font-bold mb-2">25%</div>
            <div className="text-sm font-medium">Second Prize</div>
            <div className="text-xs opacity-90">4 matches</div>
          </div>
          
          <div className="bg-gradient-to-r from-teal-400 to-cyan-500 rounded-lg p-4 text-white text-center">
            <div className="text-2xl font-bold mb-2">15%</div>
            <div className="text-sm font-medium">Third Prize</div>
            <div className="text-xs opacity-90">3 matches</div>
          </div>
          
          <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg p-4 text-white text-center">
            <div className="text-2xl font-bold mb-2">10%</div>
            <div className="text-sm font-medium">Fourth Prize</div>
            <div className="text-xs opacity-90">2 matches</div>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2 text-blue-700">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Better Odds:</span>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            5/35 system offers better winning chances than traditional 6/49 lotteries.
            Match just 2 numbers to win a prize!
          </p>
        </div>
      </div>

      {/* How to Play */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-4">
          How to Play
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-3">
              1
            </div>
            <h4 className="font-semibold text-slate-900 mb-2">
              Select Numbers
            </h4>
            <p className="text-sm text-slate-600">
              Choose 5 numbers from 1 to 35, or use Quick Pick for random selection
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-3">
              2
            </div>
            <h4 className="font-semibold text-slate-900 mb-2">
              Purchase Tickets
            </h4>
            <p className="text-sm text-slate-600">
              Buy your tickets for 10 KAS each using your connected wallet
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-3">
              3
            </div>
            <h4 className="font-semibold text-slate-900 mb-2">
              Win Prizes
            </h4>
            <p className="text-sm text-slate-600">
              Match 2 or more numbers to win! Draws happen every 3.5 days
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlayV2