import { Calendar, Trophy, Users, Coins, RefreshCw } from 'lucide-react'
import { useDrawResults } from '../hooks/useDrawResults'

const Results = () => {
  const { drawResults, isLoading, refetch } = useDrawResults()

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
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Lottery Results
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Check the latest winning numbers and prize distributions
        </p>
        
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Results</span>
        </button>
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
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Winning Numbers
                </h3>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  {result.winningNumbers.map((number, index) => (
                    <div
                      key={index}
                      className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full flex items-center justify-center text-lg font-bold shadow-lg"
                    >
                      {number}
                    </div>
                  ))}
                </div>
              </div>

              {/* Prize Breakdown */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Prize Breakdown
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
                      {result.winners.jackpot > 0 ? 'winner(s)' : 'No winners'}
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
                      {result.winners.second > 0 ? 'winner(s)' : 'No winners'}
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
                      {result.winners.third > 0 ? 'winner(s)' : 'No winners'}
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
                      {result.winners.fourth > 0 ? 'winner(s)' : 'No winners'}
                    </div>
                    <div className="text-xs mt-1">
                      {result.winners.fourth > 0 ? getPrizeAmount(result, 'fourth') : '-'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {drawResults.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No Results Available
          </h3>
          <p className="text-gray-500">
            No draws have been executed yet. Check back after the first draw!
          </p>
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