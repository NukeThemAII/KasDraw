import { Calendar, Trophy, Users, Coins, RefreshCw, Wallet, TrendingUp } from 'lucide-react'
import { useDrawResults } from '../hooks/useDrawResults'
import { useLotteryContract } from '../hooks/useLotteryContract'
import { useRolloverAmount, useLastFourDrawsWinners } from '../hooks/useWinnerData'
import { formatEther } from 'viem'

const Results = () => {
  const { drawResults, isLoading, refetch } = useDrawResults()
  const { lotteryState } = useLotteryContract()
  const { rolloverAmount, isLoading: rolloverLoading } = useRolloverAmount()
  const { allWinners, isLoading: winnersLoading } = useLastFourDrawsWinners()

  const currentJackpot = lotteryState ? lotteryState.accumulatedJackpot : '0'
  const stateLoading = !lotteryState

  const handleRefresh = async () => {
    try {
      await refetch()
    } catch (error) {
      console.error('Error refreshing results:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getPrizeAmount = (result: any, tier: keyof typeof result.winners) => {
    if (tier === 'jackpot' && result.winners.jackpot === 0) {
      return 'Rolled Over'
    }
    
    const prizeAmount = parseFloat(result.prizeAmounts[tier])
    if (prizeAmount === 0) {
      return 'No Winners'
    }
    
    return `${prizeAmount.toFixed(4)} KAS`
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent mb-4">
          BlockDAG Lottery Results
        </h1>
        <p className="text-lg text-slate-600 mb-2">
          Check the latest GhostDAG winning numbers and prize distributions
        </p>
        <p className="text-sm text-cyan-600 mb-6">
          Powered by Kaspa's Parallel Block Processing • Instant Finality
        </p>
        
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="kaspa-button inline-flex items-center space-x-2 px-6 py-3 text-white rounded-lg disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Syncing BlockDAG...' : 'Refresh GhostDAG Results'}</span>
        </button>
      </div>

      {/* Live Jackpot & Rollover Info */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl shadow-lg text-white p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-2 mb-2">
              <Trophy className="w-6 h-6" />
              <span className="text-lg font-semibold">Current Live Jackpot</span>
            </div>
            <div className="text-4xl font-bold mb-2">
              {stateLoading ? (
                <div className="animate-pulse bg-white/20 rounded h-12 w-48 mx-auto md:mx-0"></div>
              ) : (
                `${parseFloat(currentJackpot).toFixed(4)} KAS`
              )}
            </div>
            <p className="text-sm opacity-90">Real-time blockchain data</p>
          </div>
          
          <div className="text-center md:text-right">
            <div className="flex items-center justify-center md:justify-end space-x-2 mb-2">
              <TrendingUp className="w-6 h-6" />
              <span className="text-lg font-semibold">Next Draw Rollover</span>
            </div>
            <div className="text-4xl font-bold mb-2">
              {rolloverLoading ? (
                <div className="animate-pulse bg-white/20 rounded h-12 w-48 mx-auto md:mx-0"></div>
              ) : (
                `${parseFloat(rolloverAmount).toFixed(4)} KAS`
              )}
            </div>
            <p className="text-sm opacity-90">Available for next draw</p>
          </div>
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-6">
        {drawResults.map((result) => (
          <div key={result.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="w-5 h-5" />
                    <span className="text-lg font-semibold">
                      {formatDate(result.date)}
                    </span>
                  </div>
                  <div className="text-3xl font-bold">
                    Jackpot: {parseFloat(result.jackpotAmount).toFixed(4)} KAS
                  </div>
                </div>
                <div className="mt-4 md:mt-0 text-right">
                  <div className="text-sm opacity-90">Draw #{result.id}</div>
                  <div className="flex items-center space-x-2 mt-1">
                    <Users className="w-4 h-4" />
                    <span>{result.totalTickets.toLocaleString()} tickets sold</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Winning Numbers */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-4">
                  GhostDAG Winning Numbers
                </h3>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  {result.winningNumbers.map((number, index) => (
                    <div
                      key={index}
                      className="kaspa-winning-number w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-lg"
                    >
                      {number}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-cyan-600 mt-3">
                  Generated by BlockDAG consensus algorithm
                </p>
              </div>

              {/* Prize Breakdown */}
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">
                  BlockDAG Prize Distribution
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-4 text-white">
                    <div className="flex items-center space-x-2 mb-2">
                      <Trophy className="w-5 h-5" />
                      <span className="font-semibold">Jackpot (6 matches)</span>
                    </div>
                    <div className="text-2xl font-bold mb-1">
                      {result.winners.jackpot}
                    </div>
                    <div className="text-sm opacity-90">
                      {result.winners.jackpot > 0 ? 'ghost winner(s)' : 'No winners'}
                    </div>
                    <div className="text-xs mt-1">
                      {getPrizeAmount(result, 'jackpot')}
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-lg p-4 text-white">
                    <div className="flex items-center space-x-2 mb-2">
                      <Coins className="w-5 h-5" />
                      <span className="font-semibold">Second (5 matches)</span>
                    </div>
                    <div className="text-2xl font-bold mb-1">
                      {result.winners.second}
                    </div>
                    <div className="text-sm opacity-90">
                      {result.winners.second > 0 ? 'ghost winner(s)' : 'No winners'}
                    </div>
                    <div className="text-xs mt-1">
                      {result.winners.second > 0 ? getPrizeAmount(result, 'second') : '-'}
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg p-4 text-white">
                    <div className="flex items-center space-x-2 mb-2">
                      <Coins className="w-5 h-5" />
                      <span className="font-semibold">Third (4 matches)</span>
                    </div>
                    <div className="text-2xl font-bold mb-1">
                      {result.winners.third}
                    </div>
                    <div className="text-sm opacity-90">
                      {result.winners.third > 0 ? 'ghost winner(s)' : 'No winners'}
                    </div>
                    <div className="text-xs mt-1">
                      {result.winners.third > 0 ? getPrizeAmount(result, 'third') : '-'}
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-cyan-400 to-teal-500 rounded-lg p-4 text-white">
                    <div className="flex items-center space-x-2 mb-2">
                      <Coins className="w-5 h-5" />
                      <span className="font-semibold">Fourth (3 matches)</span>
                    </div>
                    <div className="text-2xl font-bold mb-1">
                      {result.winners.fourth}
                    </div>
                    <div className="text-sm opacity-90">
                      {result.winners.fourth > 0 ? 'ghost winner(s)' : 'No winners'}
                    </div>
                    <div className="text-xs mt-1">
                      {result.winners.fourth > 0 ? getPrizeAmount(result, 'fourth') : '-'}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-cyan-600 mt-4">
                  Prizes distributed via Kaspa's instant finality protocol
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {drawResults.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="text-cyan-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            No BlockDAG Results Available
          </h3>
          <p className="text-slate-600 mb-2">
            No GhostDAG lottery results found. Check back after the next parallel draw!
          </p>
          <p className="text-sm text-cyan-600 mb-6">
            The BlockDAG is processing new blocks continuously
          </p>
          <button
            onClick={handleRefresh}
            className="kaspa-button inline-flex items-center space-x-2 px-6 py-3 text-white rounded-lg"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Sync BlockDAG</span>
          </button>
        </div>
      )}

      {/* Recent Winners Section */}
      {allWinners.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Wallet className="w-6 h-6 text-cyan-600" />
            <h2 className="text-2xl font-bold text-slate-900">Recent Winners - Last 4 Draws</h2>
          </div>
          
          {winnersLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-6 h-6 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading winner data...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {allWinners.map((winner, index) => (
                <div key={`${winner.drawId}-${winner.address}-${index}`} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg border border-cyan-200">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="bg-cyan-600 text-white px-2 py-1 rounded text-sm font-semibold">
                        Draw #{winner.drawId}
                      </div>
                      <div className="bg-green-600 text-white px-2 py-1 rounded text-sm font-semibold">
                        {winner.matchCount} matches
                      </div>
                      {winner.claimed && (
                        <div className="bg-yellow-600 text-white px-2 py-1 rounded text-sm font-semibold">
                          Claimed
                        </div>
                      )}
                    </div>
                    <div className="font-mono text-sm text-slate-700 break-all">
                      {winner.address}
                    </div>
                  </div>
                  <div className="mt-3 md:mt-0 md:text-right">
                    <div className="text-lg font-bold text-cyan-600">
                      {parseFloat(winner.prizeAmount).toFixed(4)} KAS
                    </div>
                    <div className="text-sm text-slate-500">
                      Prize Amount
                    </div>
                  </div>
                </div>
              ))}
              
              {allWinners.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No winners found in the last 4 draws</p>
                  <p className="text-sm mt-2">Winners will appear here after draws are executed</p>
                </div>
              )}
            </div>
          )}
          
          <div className="mt-6 p-4 bg-cyan-50 rounded-lg border border-cyan-200">
            <p className="text-sm text-cyan-700">
              <strong>Note:</strong> Winner addresses are displayed from the last 4 completed draws. 
              All data is sourced directly from the blockchain for transparency and verification.
            </p>
          </div>
        </div>
      )}
      
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading draw results...</p>
        </div>
      )}
    </div>
  )
}

export default Results