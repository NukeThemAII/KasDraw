import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Trophy, Clock, Users, Coins, Play, Info, Zap, TrendingUp, Award } from 'lucide-react'
import { useLotteryContractV2, useRecentDraws } from '../hooks/useLotteryContractV2'

const HomeV2: React.FC = () => {
  const {
    lotteryStats,
    drawExecutionInfo,
    isLoading,
    refreshAllData
  } = useLotteryContractV2()

  const { recentDraws } = useRecentDraws(3)
  const [countdown, setCountdown] = useState('')

  // Update countdown timer
  useEffect(() => {
    if (!drawExecutionInfo) return

    const updateCountdown = () => {
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

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshAllData()
    }, 30000)

    return () => clearInterval(interval)
  }, [refreshAllData])

  const currentJackpot = lotteryStats?.currentJackpot || '0'
  const totalPlayers = lotteryStats?.totalTickets ? Math.floor(lotteryStats.totalTickets / 3) : 0
  const ticketsSold = lotteryStats?.totalTickets || 0
  const currentDrawTickets = lotteryStats?.currentDrawTickets || 0

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center py-12">
          <div className="animate-spin w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Loading BlockDAG lottery...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12">
        <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent mb-4">
          KasDraw
        </h1>
        <p className="text-xl text-slate-600 mb-4">
          Next-Generation BlockDAG Lottery
        </p>
        <p className="text-sm text-cyan-600 mb-8">
          Powered by Kasplex Network • Instant Finality • Enhanced Security
        </p>
        
        {/* Enhanced Jackpot Display */}
        <div className="relative bg-gradient-to-br from-emerald-400 via-cyan-500 to-blue-600 rounded-3xl p-10 text-white mb-8 overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent transform rotate-45 animate-pulse"></div>
          </div>
          
          {/* Floating particles effect */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white rounded-full opacity-30 animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <Trophy className="w-12 h-12 text-yellow-300 animate-pulse" />
              <span className="text-3xl font-bold tracking-wide">CURRENT JACKPOT</span>
              <Trophy className="w-12 h-12 text-yellow-300 animate-pulse" />
            </div>
            
            <div className="text-6xl md:text-8xl font-black mb-4 text-center">
              <span className="bg-gradient-to-r from-yellow-200 via-yellow-100 to-white bg-clip-text text-transparent drop-shadow-2xl animate-pulse">
                {parseFloat(currentJackpot).toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </span>
              <span className="text-4xl md:text-5xl ml-4 text-yellow-200 font-bold">KAS</span>
            </div>
            
            <div className="text-lg text-cyan-100 text-center font-semibold mb-4">
              ≈ ${(parseFloat(currentJackpot) * 0.15).toLocaleString(undefined, { maximumFractionDigits: 2 })} USD
            </div>
            
            <div className="text-xl text-cyan-100 text-center font-semibold">
              🎯 Next draw in: <span className="text-yellow-200 font-bold">{countdown}</span>
            </div>
            
            {/* Live indicator */}
            <div className="flex items-center justify-center space-x-2 mt-4">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-200">Live on Kasplex Network</span>
            </div>
          </div>
          
          {/* Enhanced glow effect */}
          <div className="absolute inset-0 rounded-3xl shadow-2xl" style={{
            boxShadow: '0 0 80px rgba(16, 185, 129, 0.8), inset 0 0 80px rgba(255, 255, 255, 0.1)'
          }}></div>
        </div>
        
        <Link
          to="/play"
          className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-xl font-semibold text-lg transform hover:scale-105 transition-all shadow-lg hover:shadow-xl"
        >
          <Play className="w-6 h-6" />
          <span>Enter BlockDAG Lottery</span>
          <Zap className="w-5 h-5" />
        </Link>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
          <Users className="w-12 h-12 text-cyan-500 mx-auto mb-4" />
          <div className="text-3xl font-bold text-slate-900 mb-2">
            {totalPlayers.toLocaleString()}
          </div>
          <div className="text-cyan-600 font-medium">Active Players</div>
          <div className="text-xs text-slate-500 mt-1">Estimated unique participants</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
          <Coins className="w-12 h-12 text-teal-500 mx-auto mb-4" />
          <div className="text-3xl font-bold text-slate-900 mb-2">
            {ticketsSold.toLocaleString()}
          </div>
          <div className="text-cyan-600 font-medium">Total Tickets</div>
          <div className="text-xs text-slate-500 mt-1">All-time sales</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
          <Clock className="w-12 h-12 text-cyan-500 mx-auto mb-4" />
          <div className="text-3xl font-bold text-slate-900 mb-2">
            {currentDrawTickets}
          </div>
          <div className="text-cyan-600 font-medium">Current Draw</div>
          <div className="text-xs text-slate-500 mt-1">Tickets sold this round</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
          <TrendingUp className="w-12 h-12 text-purple-500 mx-auto mb-4" />
          <div className="text-3xl font-bold text-slate-900 mb-2">
            {lotteryStats?.totalPrizesDistributed ? 
              parseFloat(lotteryStats.totalPrizesDistributed).toLocaleString(undefined, { maximumFractionDigits: 0 }) : 
              '0'
            }
          </div>
          <div className="text-cyan-600 font-medium">KAS Distributed</div>
          <div className="text-xs text-slate-500 mt-1">Total prizes paid out</div>
        </div>
      </div>

      {/* Recent Draws */}
      {recentDraws.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center space-x-2">
            <Award className="w-6 h-6 text-cyan-500" />
            <span>Recent Draws</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentDraws.slice(0, 3).map((draw) => (
              <div key={draw.id} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-slate-900">Draw #{draw.id}</span>
                  <span className="text-sm text-slate-500">
                    {new Date(draw.timestamp * 1000).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex space-x-2 mb-3">
                  {draw.winningNumbers.map((number, index) => (
                    <div
                      key={index}
                      className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg flex items-center justify-center text-sm font-bold"
                    >
                      {number}
                    </div>
                  ))}
                </div>
                
                <div className="text-sm text-slate-600">
                  <div>Prize Pool: {parseFloat(draw.totalPrizePool).toLocaleString()} KAS</div>
                  <div>Tickets: {draw.totalTickets}</div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-6">
            <Link
              to="/results"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <span>View All Results</span>
              <TrendingUp className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Enhanced How to Play */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-6 text-center">
          How BlockDAG Lottery Works
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
              1
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Select Ghost Numbers
            </h3>
            <p className="text-cyan-600">
              Choose 5 numbers from 1 to 35 or use Quick Pick for random selection. 
              Better odds than traditional lotteries!
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
              2
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Purchase Tickets
            </h3>
            <p className="text-cyan-600">
              Buy tickets for 10 KAS each using your Kasplex wallet. 
              Instant confirmation on the BlockDAG network.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
              3
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Win Big Prizes
            </h3>
            <p className="text-cyan-600">
              Match 2+ numbers to win! Draws happen every 3.5 days with 
              multiple prize tiers and instant payouts.
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Prize Structure */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-6 text-center">
          Prize Structure & Winning Odds
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-6 text-white text-center transform hover:scale-105 transition-transform">
            <div className="text-3xl font-bold mb-2">50%</div>
            <div className="text-lg font-medium mb-1">Jackpot</div>
            <div className="text-sm opacity-90">5 matches</div>
            <div className="text-xs mt-2 bg-black bg-opacity-20 rounded px-2 py-1">
              1 in 324,632
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-cyan-400 to-teal-500 rounded-lg p-6 text-white text-center transform hover:scale-105 transition-transform">
            <div className="text-3xl font-bold mb-2">25%</div>
            <div className="text-lg font-medium mb-1">Second Prize</div>
            <div className="text-sm opacity-90">4 matches</div>
            <div className="text-xs mt-2 bg-black bg-opacity-20 rounded px-2 py-1">
              1 in 7,624
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-teal-400 to-cyan-500 rounded-lg p-6 text-white text-center transform hover:scale-105 transition-transform">
            <div className="text-3xl font-bold mb-2">15%</div>
            <div className="text-lg font-medium mb-1">Third Prize</div>
            <div className="text-sm opacity-90">3 matches</div>
            <div className="text-xs mt-2 bg-black bg-opacity-20 rounded px-2 py-1">
              1 in 344
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg p-6 text-white text-center transform hover:scale-105 transition-transform">
            <div className="text-3xl font-bold mb-2">10%</div>
            <div className="text-lg font-medium mb-1">Fourth Prize</div>
            <div className="text-sm opacity-90">2 matches</div>
            <div className="text-xs mt-2 bg-black bg-opacity-20 rounded px-2 py-1">
              1 in 35
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-200">
            <div className="flex items-center space-x-2 text-cyan-700 mb-2">
              <Info className="w-5 h-5" />
              <span className="font-semibold">Enhanced Odds</span>
            </div>
            <p className="text-sm text-cyan-600">
              Our 5/35 system offers much better odds than traditional 6/49 lotteries. 
              Overall chance of winning any prize: 1 in 32!
            </p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-2 text-green-700 mb-2">
              <Zap className="w-5 h-5" />
              <span className="font-semibold">Instant Payouts</span>
            </div>
            <p className="text-sm text-green-600">
              All prizes are paid instantly on the Kasplex network. 
              No waiting periods - claim your winnings immediately!
            </p>
          </div>
        </div>
      </div>

      {/* Network Features */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl shadow-lg p-8 text-white">
        <h2 className="text-3xl font-bold mb-6 text-center">
          Powered by Kasplex Network
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <Zap className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Instant Finality</h3>
            <p className="text-slate-300 text-sm">
              Transactions confirm instantly with BlockDAG technology. 
              No waiting for block confirmations.
            </p>
          </div>
          
          <div className="text-center">
            <TrendingUp className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Parallel Processing</h3>
            <p className="text-slate-300 text-sm">
              Multiple transactions processed simultaneously. 
              Higher throughput, lower fees.
            </p>
          </div>
          
          <div className="text-center">
            <Award className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Provably Fair</h3>
            <p className="text-slate-300 text-sm">
              All draws are transparent and verifiable on-chain. 
              Complete fairness guaranteed.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomeV2