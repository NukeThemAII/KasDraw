import React, { useState, useEffect } from 'react'
import { Clock, Zap, Users, Trophy } from 'lucide-react'
import { useLotteryContract } from '../hooks/useLotteryContract'
import { toast } from 'sonner'

const Draw: React.FC = () => {
  const {
    lotteryState,
    canExecuteDrawPublic,
    executeDrawPublic,
    isExecutingDraw,
    refetchCanExecuteDrawPublic,
    refetchLotteryState
  } = useLotteryContract()

  const [timeLeft, setTimeLeft] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  const [nextDrawTime, setNextDrawTime] = useState<Date | null>(null)

  // Calculate next draw time (7 days from now for demo)
  useEffect(() => {
    // In a real implementation, this would come from the smart contract
    // For now, we'll simulate a 7-day countdown
    const now = new Date()
    const next = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    setNextDrawTime(next)
  }, [])

  // Update countdown timer
  useEffect(() => {
    if (!nextDrawTime) return

    const timer = setInterval(() => {
      const now = new Date().getTime()
      const distance = nextDrawTime.getTime() - now

      if (distance > 0) {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24))
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((distance % (1000 * 60)) / 1000)

        setTimeLeft({ days, hours, minutes, seconds })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        // Refetch to check if draw can be executed
        refetchCanExecuteDrawPublic()
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [nextDrawTime, refetchCanExecuteDrawPublic])

  const handleExecuteDraw = async () => {
    try {
      await executeDrawPublic()
      toast.success('Draw executed successfully! You earned 0.1 KAS reward!')
      // Refetch state after execution
      refetchLotteryState()
      refetchCanExecuteDrawPublic()
    } catch (error) {
      console.error('Error executing draw:', error)
      toast.error('Failed to execute draw')
    }
  }

  const isDrawReady = canExecuteDrawPublic && timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Execute Draw
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Anyone can trigger the lottery draw after the 7-day interval. 
            The executor receives a <span className="text-yellow-400 font-semibold">0.1 KAS reward</span>!
          </p>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Countdown Timer */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <div className="flex items-center justify-center mb-6">
              <Clock className="w-8 h-8 text-yellow-400 mr-3" />
              <h2 className="text-2xl font-bold text-white">Next Draw Countdown</h2>
            </div>
            
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="bg-white/20 rounded-lg p-4">
                <div className="text-3xl font-bold text-yellow-400">{timeLeft.days}</div>
                <div className="text-sm text-gray-300">Days</div>
              </div>
              <div className="bg-white/20 rounded-lg p-4">
                <div className="text-3xl font-bold text-yellow-400">{timeLeft.hours}</div>
                <div className="text-sm text-gray-300">Hours</div>
              </div>
              <div className="bg-white/20 rounded-lg p-4">
                <div className="text-3xl font-bold text-yellow-400">{timeLeft.minutes}</div>
                <div className="text-sm text-gray-300">Minutes</div>
              </div>
              <div className="bg-white/20 rounded-lg p-4">
                <div className="text-3xl font-bold text-yellow-400">{timeLeft.seconds}</div>
                <div className="text-sm text-gray-300">Seconds</div>
              </div>
            </div>

            {nextDrawTime && (
              <div className="mt-6 text-center">
                <p className="text-gray-300">
                  Next draw available: <span className="text-white font-semibold">
                    {nextDrawTime.toLocaleString()}
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Execute Draw Section */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <div className="flex items-center justify-center mb-6">
              <Zap className="w-8 h-8 text-yellow-400 mr-3" />
              <h2 className="text-2xl font-bold text-white">Execute Draw</h2>
            </div>

            <div className="space-y-6">
              {/* Current Status */}
              <div className="text-center">
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                  isDrawReady 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                }`}>
                  {isDrawReady ? 'Draw Ready!' : 'Draw Not Ready'}
                </div>
              </div>

              {/* Reward Info */}
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <div className="flex items-center justify-center mb-2">
                  <Trophy className="w-5 h-5 text-yellow-400 mr-2" />
                  <span className="text-yellow-400 font-semibold">Executor Reward</span>
                </div>
                <div className="text-center">
                  <span className="text-2xl font-bold text-white">0.1 KAS</span>
                  <p className="text-sm text-gray-300 mt-1">
                    Automatically sent to the executor's wallet
                  </p>
                </div>
              </div>

              {/* Execute Button */}
              <button
                onClick={handleExecuteDraw}
                disabled={!isDrawReady || isExecutingDraw}
                className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 ${
                  isDrawReady && !isExecutingDraw
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-300 hover:to-orange-400 transform hover:scale-105 shadow-lg hover:shadow-xl'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}>
                {isExecutingDraw ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                    Executing Draw...
                  </div>
                ) : isDrawReady ? (
                  'Execute Draw & Earn 0.1 KAS'
                ) : (
                  'Wait for Draw Interval'
                )}
              </button>

              {!isDrawReady && (
                <p className="text-sm text-gray-400 text-center">
                  The draw can only be executed after the 7-day interval has passed
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Current Lottery Stats */}
        {lotteryState && (
          <div className="mt-8 bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <div className="flex items-center justify-center mb-6">
              <Users className="w-8 h-8 text-yellow-400 mr-3" />
              <h2 className="text-2xl font-bold text-white">Current Lottery Stats</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-yellow-400">
                  #{lotteryState.currentDrawId}
                </div>
                <div className="text-gray-300">Current Draw</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-yellow-400">
                  {lotteryState.totalTicketsSold}
                </div>
                <div className="text-gray-300">Tickets Sold</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-yellow-400">
                  {parseFloat(lotteryState.accumulatedJackpot).toFixed(2)} KAS
                </div>
                <div className="text-gray-300">Jackpot Pool</div>
              </div>
            </div>
          </div>
        )}

        {/* How It Works */}
        <div className="mt-8 bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">How Decentralized Draw Execution Works</h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-black font-bold text-xl">1</span>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Wait for Interval</h4>
              <p className="text-gray-300 text-sm">
                Each draw has a 7-day interval. Anyone can execute the draw once this time has passed.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-black font-bold text-xl">2</span>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Execute Draw</h4>
              <p className="text-gray-300 text-sm">
                Click the execute button to trigger the draw. The smart contract will generate random winning numbers.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-black font-bold text-xl">3</span>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Earn Reward</h4>
              <p className="text-gray-300 text-sm">
                Receive 0.1 KAS as a reward for executing the draw and helping maintain the lottery system.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Draw