import React, { useState, useEffect } from 'react'
import { Clock, Zap, Users, Trophy, Timer } from 'lucide-react'
import { useLotteryContract } from '../hooks/useLotteryContract'
import { toast } from 'sonner'

const Draw: React.FC = () => {
  const {
    lotteryState,
    canExecuteDrawPublic,
    timeRemaining,
    nextDrawTime: contractNextDrawTime,
    blocksRemaining,
    nextDrawBlock,
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

  const [isTimerReady, setIsTimerReady] = useState(false)

  // Use blockchain data directly for countdown timer
  useEffect(() => {
    if (timeRemaining && timeRemaining > 0) {
      const days = Math.floor(timeRemaining / (24 * 60 * 60))
      const hours = Math.floor((timeRemaining % (24 * 60 * 60)) / (60 * 60))
      const minutes = Math.floor((timeRemaining % (60 * 60)) / 60)
      const seconds = timeRemaining % 60

      setTimeLeft({ days, hours, minutes, seconds })
      setIsTimerReady(false)
    } else {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      setIsTimerReady(true)
    }
  }, [timeRemaining])

  const handleExecuteDraw = async () => {
    try {
      const currentReward = lotteryState ? 
        Math.max(0.1, Math.min(10, parseFloat(lotteryState.accumulatedJackpot || '0') * 0.001)) : 
        0.1
      
      await executeDrawPublic()
      toast.success(`Draw executed successfully! You earned ${currentReward.toFixed(3)} KAS reward!`)
      // Refetch state after execution
      refetchLotteryState()
      refetchCanExecuteDrawPublic()
    } catch (error) {
      console.error('Error executing draw:', error)
      toast.error('Failed to execute draw')
    }
  }

  // Enhanced security: Multiple validation layers with block-based timing to prevent premature execution
  const isDrawReady = Boolean(
    canExecuteDrawPublic && // Smart contract confirms execution is allowed (timestamp + block validation)
    lotteryState?.canExecute && // Additional smart contract validation
    (blocksRemaining === undefined || blocksRemaining <= 0) && // Block-based validation
    (timeRemaining === undefined || timeRemaining <= 0) // Direct time remaining validation
  )

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
            Anyone can trigger the lottery draw after the 3.5-day interval (twice per week). 
            The executor receives a <span className="text-yellow-400 font-semibold">percentage-based reward</span> that grows with the jackpot!
          </p>
        </div>

        {/* Timer and Execute Draw Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Compact Timer - Left Side (Smaller) */}
            <div className="lg:w-1/3">
              <div className="bg-gradient-to-br from-teal-500/20 via-cyan-500/20 to-emerald-500/20 backdrop-blur-md rounded-xl p-4 border-2 border-teal-400/30 shadow-xl">
                <div className="flex items-center justify-center mb-3">
                  <Timer className="w-6 h-6 text-teal-400 mr-2" />
                  <h2 className="text-lg font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                    Next Draw
                  </h2>
                </div>
                
                {/* Compact Timer Display */}
                <div className="grid grid-cols-4 gap-2 mb-3">
                  <div className="bg-gradient-to-br from-teal-600/30 to-cyan-600/30 rounded-lg p-2 border border-teal-400/40">
                    <div className="text-xl font-black text-teal-300 font-mono tracking-tight text-center">
                      {timeLeft.days.toString().padStart(2, '0')}
                    </div>
                    <div className="text-xs text-teal-200 font-semibold text-center">Days</div>
                  </div>
                  <div className="bg-gradient-to-br from-teal-600/30 to-cyan-600/30 rounded-lg p-2 border border-teal-400/40">
                    <div className="text-xl font-black text-teal-300 font-mono tracking-tight text-center">
                      {timeLeft.hours.toString().padStart(2, '0')}
                    </div>
                    <div className="text-xs text-teal-200 font-semibold text-center">Hours</div>
                  </div>
                  <div className="bg-gradient-to-br from-teal-600/30 to-cyan-600/30 rounded-lg p-2 border border-teal-400/40">
                    <div className="text-xl font-black text-teal-300 font-mono tracking-tight text-center">
                      {timeLeft.minutes.toString().padStart(2, '0')}
                    </div>
                    <div className="text-xs text-teal-200 font-semibold text-center">Minutes</div>
                  </div>
                  <div className="bg-gradient-to-br from-teal-600/30 to-cyan-600/30 rounded-lg p-2 border border-teal-400/40">
                    <div className="text-xl font-black text-teal-300 font-mono tracking-tight text-center">
                      {timeLeft.seconds.toString().padStart(2, '0')}
                    </div>
                    <div className="text-xs text-teal-200 font-semibold text-center">Seconds</div>
                  </div>
                </div>

                {/* Compact Blockchain Data Display */}
                <div className="text-center space-y-1">
                  {contractNextDrawTime && contractNextDrawTime > 0 && (
                    <p className="text-xs text-teal-100">
                      Next: <span className="text-teal-300 font-bold">
                        {new Date(contractNextDrawTime * 1000).toLocaleDateString()}
                      </span>
                    </p>
                  )}
                  
                  {/* Compact Blockchain Indicators */}
                  <div className="flex justify-center space-x-2">
                    <div className={`px-2 py-1 rounded border transition-all duration-300 ${
                      timeRemaining !== undefined && timeRemaining <= 0 
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50' 
                        : 'bg-orange-500/20 text-orange-300 border-orange-400/50'
                    }`}>
                      <div className="text-xs font-semibold">Time: {timeRemaining !== undefined ? (timeRemaining <= 0 ? '✓' : `${timeRemaining}s`) : '...'}</div>
                    </div>
                    <div className={`px-2 py-1 rounded border transition-all duration-300 ${
                      blocksRemaining !== undefined && blocksRemaining <= 0 
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50' 
                        : 'bg-orange-500/20 text-orange-300 border-orange-400/50'
                    }`}>
                      <div className="text-xs font-semibold">Blocks: {blocksRemaining !== undefined ? (blocksRemaining <= 0 ? '✓' : blocksRemaining) : '...'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Execute Draw Section - Right Side */}
            <div className="lg:w-2/3">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 h-full">
                <div className="flex items-center justify-center mb-4">
                  <Zap className="w-8 h-8 text-yellow-400 mr-3" />
                  <h2 className="text-2xl font-bold text-white">Execute Draw</h2>
                </div>

                <div className="space-y-4">
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
                  <div className="bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border-2 border-teal-400/30 rounded-xl p-4">
                    <div className="flex items-center justify-center mb-2">
                      <Trophy className="w-5 h-5 text-teal-400 mr-2" />
                      <span className="text-teal-400 font-bold">Executor Reward</span>
                    </div>
                    <div className="text-center">
                      <span className="text-2xl font-black text-teal-300 font-mono">
                        {lotteryState ? 
                          `${(parseFloat(lotteryState.accumulatedJackpot || '0') * 0.001).toFixed(3)} KAS` : 
                          '0.100 KAS'
                        }
                      </span>
                      <p className="text-xs text-teal-200 mt-1">
                        0.1% of jackpot (min: 0.1, max: 10 KAS)
                      </p>
                    </div>
                  </div>

                  {/* Execute Button */}
                  <button
                    onClick={handleExecuteDraw}
                    disabled={!isDrawReady || isExecutingDraw}
                    className={`w-full py-3 px-4 rounded-xl font-bold transition-all duration-300 ${
                      isDrawReady && !isExecutingDraw
                        ? 'bg-gradient-to-r from-teal-400 to-cyan-500 text-black hover:from-teal-300 hover:to-cyan-400 transform hover:scale-105 shadow-lg'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}>
                    {isExecutingDraw ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                        Executing...
                      </div>
                    ) : isDrawReady ? (
                      `Execute & Earn ${
                        lotteryState ? 
                          Math.max(0.1, Math.min(10, parseFloat(lotteryState.accumulatedJackpot || '0') * 0.001)).toFixed(3) : 
                          '0.100'
                      } KAS`
                    ) : (
                      'Wait for Interval'
                    )}
                  </button>

                  {!isDrawReady && (
                    <p className="text-xs text-gray-400 text-center">
                      Draw available after 3.5-day interval
                    </p>
                  )}
                </div>
              </div>
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
                  {parseFloat(lotteryState.accumulatedJackpot || '0').toFixed(2)} KAS
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
                Each draw has a 3.5-day interval (twice per week). Anyone can execute the draw once this time has passed.
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
                Receive 0.1% of the current jackpot (min: 0.1 KAS, max: 10 KAS) as a reward for executing the draw.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Draw