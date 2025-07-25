import React, { useState } from 'react'
import { Trophy, Clock, Users, RefreshCw, Award, TrendingUp, Eye, CheckCircle, XCircle } from 'lucide-react'
import { useLotteryContractV2, useRecentDraws, useDrawWinners } from '../hooks/useLotteryContractV2'

const ResultsV2: React.FC = () => {
  const {
    lotteryStats,
    currentDrawId,
    rolloverAmount,
    isLoading,
    refreshAllData
  } = useLotteryContractV2()

  const { recentDraws, isLoading: drawsLoading, refetch: refetchDraws } = useRecentDraws(10)
  const [selectedDrawId, setSelectedDrawId] = useState<number | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Get winners for selected draw
  const { winners, isLoading: winnersLoading } = useDrawWinners(selectedDrawId || 0)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await Promise.all([
        refreshAllData(),
        refetchDraws()
      ])
    } catch (error) {
      console.error('Error refreshing:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString()
  }

  const formatKAS = (amount: string) => {
    return parseFloat(amount).toLocaleString(undefined, { maximumFractionDigits: 2 })
  }

  const getPrizeColor = (matches: number) => {
    switch (matches) {
      case 5: return 'from-yellow-400 to-orange-500'
      case 4: return 'from-cyan-400 to-teal-500'
      case 3: return 'from-teal-400 to-cyan-500'
      case 2: return 'from-cyan-500 to-blue-500'
      default: return 'from-slate-400 to-slate-500'
    }
  }

  const getPrizeName = (matches: number) => {
    switch (matches) {
      case 5: return 'Jackpot'
      case 4: return 'Second Prize'
      case 3: return 'Third Prize'
      case 2: return 'Fourth Prize'
      default: return 'No Prize'
    }
  }

  if (isLoading || drawsLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center py-12">
          <div className="animate-spin w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Loading lottery results...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center py-8">
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent mb-4">
          Lottery Results
        </h1>
        <p className="text-xl text-slate-600 mb-4">
          View past draws and winning numbers
        </p>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={`inline-flex items-center space-x-2 px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors ${
            isRefreshing ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Results</span>
        </button>
      </div>

      {/* Current Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <div className="text-3xl font-bold text-slate-900 mb-2">
            {formatKAS(lotteryStats?.currentJackpot || '0')}
          </div>
          <div className="text-cyan-600 font-medium">Current Jackpot</div>
          <div className="text-xs text-slate-500 mt-1">KAS</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <Clock className="w-12 h-12 text-cyan-500 mx-auto mb-4" />
          <div className="text-3xl font-bold text-slate-900 mb-2">
            {currentDrawId}
          </div>
          <div className="text-cyan-600 font-medium">Current Draw</div>
          <div className="text-xs text-slate-500 mt-1">Draw number</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <TrendingUp className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <div className="text-3xl font-bold text-slate-900 mb-2">
            {formatKAS(rolloverAmount)}
          </div>
          <div className="text-cyan-600 font-medium">Rollover Amount</div>
          <div className="text-xs text-slate-500 mt-1">KAS</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <Users className="w-12 h-12 text-purple-500 mx-auto mb-4" />
          <div className="text-3xl font-bold text-slate-900 mb-2">
            {formatKAS(lotteryStats?.totalPrizesDistributed || '0')}
          </div>
          <div className="text-cyan-600 font-medium">Total Distributed</div>
          <div className="text-xs text-slate-500 mt-1">KAS</div>
        </div>
      </div>

      {/* Recent Draws */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center space-x-2">
          <Award className="w-6 h-6 text-cyan-500" />
          <span>Recent Draws</span>
        </h2>
        
        {recentDraws.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">No draws completed yet</p>
            <p className="text-slate-400 text-sm">Check back after the first draw is executed</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentDraws.map((draw) => (
              <div
                key={draw.id}
                className={`border rounded-lg p-6 transition-all cursor-pointer ${
                  selectedDrawId === draw.id
                    ? 'border-cyan-500 bg-cyan-50'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
                onClick={() => setSelectedDrawId(selectedDrawId === draw.id ? null : draw.id)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      Draw #{draw.id}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {formatDate(draw.timestamp)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-cyan-600">
                      {formatKAS(draw.totalPrizePool)} KAS
                    </div>
                    <div className="text-sm text-slate-500">
                      {draw.totalTickets} tickets
                    </div>
                  </div>
                </div>
                
                {/* Winning Numbers */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-slate-700 mb-2">Winning Numbers:</p>
                  <div className="flex space-x-3">
                    {draw.winningNumbers.map((number, index) => (
                      <div
                        key={index}
                        className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg flex items-center justify-center font-bold text-lg shadow-md"
                      >
                        {number}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Draw Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">Jackpot:</span>
                    <div className="font-semibold text-slate-900">
                      {formatKAS(draw.jackpotAmount)} KAS
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">Tickets:</span>
                    <div className="font-semibold text-slate-900">
                      {draw.totalTickets}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">Executor:</span>
                    <div className="font-mono text-xs text-slate-700">
                      {draw.executor.slice(0, 6)}...{draw.executor.slice(-4)}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-500">
                      {selectedDrawId === draw.id ? 'Hide' : 'View'} Winners
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Winners Details */}
      {selectedDrawId && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span>Draw #{selectedDrawId} Winners</span>
          </h3>
          
          {winnersLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-slate-600">Loading winners...</p>
            </div>
          ) : winners.length === 0 ? (
            <div className="text-center py-8">
              <XCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No winners for this draw</p>
              <p className="text-slate-400 text-sm">All prizes roll over to the next draw</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Group winners by match count */}
              {[5, 4, 3, 2].map((matches) => {
                const matchWinners = winners.filter(w => w.matchCount === matches)
                if (matchWinners.length === 0) return null
                
                return (
                  <div key={matches} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`w-8 h-8 bg-gradient-to-r ${getPrizeColor(matches)} rounded-lg flex items-center justify-center text-white font-bold text-sm`}>
                        {matches}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">
                          {getPrizeName(matches)} ({matches} matches)
                        </h4>
                        <p className="text-sm text-slate-600">
                          {matchWinners.length} winner{matchWinners.length !== 1 ? 's' : ''} • {formatKAS(matchWinners[0]?.prizeAmount || '0')} KAS each
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {matchWinners.map((winner, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                        >
                          <div>
                            <div className="font-mono text-sm text-slate-700">
                              {winner.address.slice(0, 6)}...{winner.address.slice(-4)}
                            </div>
                            <div className="text-xs text-slate-500">
                              {formatKAS(winner.prizeAmount)} KAS
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            {winner.claimed ? (
                              <>
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span className="text-xs text-green-600">Claimed</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-4 h-4 text-orange-500" />
                                <span className="text-xs text-orange-600">Pending</span>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Prize Structure Reference */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-4">
          Prize Structure
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-4 text-white text-center">
            <div className="text-2xl font-bold mb-1">50%</div>
            <div className="text-sm font-medium">Jackpot (5 matches)</div>
            <div className="text-xs opacity-90 mt-1">1 in 324,632</div>
          </div>
          
          <div className="bg-gradient-to-r from-cyan-400 to-teal-500 rounded-lg p-4 text-white text-center">
            <div className="text-2xl font-bold mb-1">25%</div>
            <div className="text-sm font-medium">Second (4 matches)</div>
            <div className="text-xs opacity-90 mt-1">1 in 7,624</div>
          </div>
          
          <div className="bg-gradient-to-r from-teal-400 to-cyan-500 rounded-lg p-4 text-white text-center">
            <div className="text-2xl font-bold mb-1">15%</div>
            <div className="text-sm font-medium">Third (3 matches)</div>
            <div className="text-xs opacity-90 mt-1">1 in 344</div>
          </div>
          
          <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg p-4 text-white text-center">
            <div className="text-2xl font-bold mb-1">10%</div>
            <div className="text-sm font-medium">Fourth (2 matches)</div>
            <div className="text-xs opacity-90 mt-1">1 in 35</div>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700">
            <strong>Note:</strong> If no winners are found for a prize tier, that portion rolls over to the next draw's jackpot.
            Overall odds of winning any prize: 1 in 32.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ResultsV2