import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Trophy, Clock, Users, Coins, Play, Info } from 'lucide-react'
import { LOTTERY_CONFIG } from '../config/lottery'
import { useLotteryContract } from '../hooks/useLotteryContract'

const Home = () => {
  const { lotteryState } = useLotteryContract()
  const [nextDrawTime, setNextDrawTime] = useState('')
  
  // Use dynamic data from smart contract or fallback to static values
  const currentJackpot = lotteryState?.accumulatedJackpot ? 
    parseFloat(lotteryState.accumulatedJackpot).toLocaleString(undefined, { maximumFractionDigits: 2 }) : 
    '0.00'
  const totalPlayers = lotteryState?.totalTicketsSold ? Math.floor(lotteryState.totalTicketsSold / 3) : 0 // Estimate unique players
  const ticketsSold = lotteryState?.totalTicketsSold || 0

  useEffect(() => {
    const updateNextDrawTime = () => {
      if (lotteryState?.nextDrawTime) {
        // Use real on-chain next draw time
        const now = Date.now() / 1000 // Current time in seconds
        const nextDrawTimestamp = lotteryState.nextDrawTime
        
        if (nextDrawTimestamp > now) {
          const timeUntilDraw = (nextDrawTimestamp - now) * 1000 // Convert to milliseconds
          const days = Math.floor(timeUntilDraw / (1000 * 60 * 60 * 24))
          const hours = Math.floor((timeUntilDraw % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
          const minutes = Math.floor((timeUntilDraw % (1000 * 60 * 60)) / (1000 * 60))
          
          setNextDrawTime(`${days}d ${hours}h ${minutes}m`)
        } else {
          setNextDrawTime('Draw available now!')
        }
      } else {
        // Fallback calculation if on-chain data not available
        const now = new Date()
        const nextDraw = new Date()
        
        // Find next draw day (assuming Wednesday and Saturday)
        const drawDays = [3, 6] // Wednesday = 3, Saturday = 6
        const currentDay = now.getDay()
        
        let daysUntilDraw = drawDays.find(day => day > currentDay)
        if (!daysUntilDraw) {
          daysUntilDraw = drawDays[0] + 7 // Next week's first draw day
        } else {
          daysUntilDraw = daysUntilDraw - currentDay
        }
        
        nextDraw.setDate(now.getDate() + daysUntilDraw)
        nextDraw.setHours(20, 0, 0, 0) // 8 PM
        
        const timeUntilDraw = nextDraw.getTime() - now.getTime()
        const days = Math.floor(timeUntilDraw / (1000 * 60 * 60 * 24))
        const hours = Math.floor((timeUntilDraw % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((timeUntilDraw % (1000 * 60 * 60)) / (1000 * 60))
        
        setNextDrawTime(`${days}d ${hours}h ${minutes}m`)
      }
    }
    
    updateNextDrawTime()
    
    // Update every minute
    const interval = setInterval(updateNextDrawTime, 60000)
    
    return () => clearInterval(interval)
  }, [lotteryState?.nextDrawTime])

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12">
        <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent mb-4">
          KasDraw
        </h1>
        <p className="text-xl text-slate-600 mb-4">
          BlockDAG Lottery on Kasplex Network
        </p>
        <p className="text-sm text-cyan-600 mb-8">
          Powered by GhostDAG Protocol • Instant Finality • Parallel Processing
        </p>
        
        {/* Current Jackpot */}
        <div className="relative bg-gradient-to-br from-emerald-400 via-cyan-500 to-blue-600 rounded-3xl p-10 text-white mb-8 overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent transform rotate-45 animate-pulse"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <Trophy className="w-10 h-10 text-yellow-300" />
              <span className="text-3xl font-bold tracking-wide">CURRENT JACKPOT</span>
            </div>
            <div className="text-6xl md:text-8xl font-black mb-4 text-center">
              <span className="bg-gradient-to-r from-yellow-200 via-yellow-100 to-white bg-clip-text text-transparent drop-shadow-2xl">
                {currentJackpot}
              </span>
              <span className="text-4xl md:text-5xl ml-4 text-yellow-200 font-bold">KAS</span>
            </div>
            <div className="text-xl text-cyan-100 text-center font-semibold">
              🎯 Next draw in: <span className="text-yellow-200 font-bold">{nextDrawTime}</span>
            </div>
          </div>
          
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-3xl shadow-2xl" style={{boxShadow: '0 0 60px rgba(16, 185, 129, 0.6), inset 0 0 60px rgba(255, 255, 255, 0.1)'}}></div>
        </div>
        
        <Link
          to="/play"
          className="kaspa-button inline-flex items-center space-x-3 px-8 py-4 text-white rounded-xl font-semibold text-lg transform hover:scale-105"
        >
          <Play className="w-6 h-6" />
          <span>Enter BlockDAG Lottery</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 text-center ghost-glow">
          <Users className="w-12 h-12 text-cyan-500 mx-auto mb-4" />
          <div className="text-3xl font-bold text-slate-900 mb-2">
            {totalPlayers.toLocaleString()}
          </div>
          <div className="text-cyan-600">BlockDAG Participants</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 text-center ghost-glow">
          <Coins className="w-12 h-12 text-teal-500 mx-auto mb-4" />
          <div className="text-3xl font-bold text-slate-900 mb-2">
            {ticketsSold.toLocaleString()}
          </div>
          <div className="text-cyan-600">Ghost Tickets Sold</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 text-center ghost-glow">
          <Clock className="w-12 h-12 text-cyan-500 mx-auto mb-4" />
          <div className="text-3xl font-bold text-slate-900 mb-2">
            {nextDrawTime}
          </div>
          <div className="text-cyan-600">Next GhostDAG Draw</div>
        </div>
      </div>

      {/* How to Play */}
      <div className="bg-white rounded-xl shadow-lg p-8 ghost-glow">
        <h2 className="text-3xl font-bold text-slate-900 mb-6 text-center">
          How to Play BlockDAG Lottery
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
              Choose {LOTTERY_CONFIG.NUMBERS_PER_TICKET} numbers from {LOTTERY_CONFIG.MIN_NUMBER} to {LOTTERY_CONFIG.MAX_NUMBER} or use BlockDAG Quick Pick for random selection
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
              2
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Purchase BlockDAG Tickets
            </h3>
            <p className="text-cyan-600">
              Buy your tickets for {LOTTERY_CONFIG.TICKET_PRICE} KAS each using your Kasplex wallet
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
              3
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Win Ghost Prizes
            </h3>
            <p className="text-cyan-600">
              Match numbers to win! GhostDAG draws happen {LOTTERY_CONFIG.DRAW_DAYS.join(' & ')} at {LOTTERY_CONFIG.DRAW_TIME}
            </p>
          </div>
        </div>
      </div>

      {/* Prize Structure */}
      <div className="bg-white rounded-xl shadow-lg p-8 ghost-glow">
        <h2 className="text-3xl font-bold text-slate-900 mb-6 text-center">
          BlockDAG Prize Structure
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-4 text-white text-center ghost-glow">
            <div className="text-2xl font-bold mb-2">50%</div>
            <div className="text-sm">Ghost Jackpot</div>
            <div className="text-xs opacity-90">5 matches</div>
          </div>
          
          <div className="bg-gradient-to-r from-cyan-400 to-teal-500 rounded-lg p-4 text-white text-center ghost-glow">
            <div className="text-2xl font-bold mb-2">20%</div>
            <div className="text-sm">BlockDAG Prize</div>
            <div className="text-xs opacity-90">4 matches</div>
          </div>
          
          <div className="bg-gradient-to-r from-teal-400 to-cyan-500 rounded-lg p-4 text-white text-center ghost-glow">
            <div className="text-2xl font-bold mb-2">15%</div>
            <div className="text-sm">Ghost Prize</div>
            <div className="text-xs opacity-90">3 matches</div>
          </div>
          
          <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg p-4 text-white text-center ghost-glow">
            <div className="text-2xl font-bold mb-2">10%</div>
            <div className="text-sm">Parallel Prize</div>
            <div className="text-xs opacity-90">2 matches</div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-cyan-50 rounded-lg border border-cyan-200">
          <div className="flex items-center space-x-2 text-cyan-700">
            <Info className="w-5 h-5" />
            <span className="font-semibold">BlockDAG Protocol:</span>
          </div>
          <p className="text-sm text-cyan-600 mt-2">
            1% of each ticket sale supports network maintenance. 
            If no Ghost Jackpot winner, the prize rolls over to the next GhostDAG draw!
            All transactions are processed instantly with parallel block confirmation.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Home