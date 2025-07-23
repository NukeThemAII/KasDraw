import { useState, useEffect } from 'react'
import { Calendar, Trophy, Users, Coins, RefreshCw } from 'lucide-react'
import { LOTTERY_CONFIG } from '../config/lottery'

interface DrawResult {
  id: number
  date: string
  winningNumbers: number[]
  jackpotAmount: string
  winners: {
    jackpot: number
    second: number
    third: number
    fourth: number
  }
  totalTickets: number
}

const Results = () => {
  const [results, setResults] = useState<DrawResult[]>([])
  const [loading, setLoading] = useState(false)

  // Mock data for demonstration
  useEffect(() => {
    const mockResults: DrawResult[] = [
      {
        id: 1,
        date: '2024-01-20',
        winningNumbers: [7, 14, 23, 31, 42, 49],
        jackpotAmount: '125,000',
        winners: {
          jackpot: 0,
          second: 2,
          third: 15,
          fourth: 87
        },
        totalTickets: 3891
      },
      {
        id: 2,
        date: '2024-01-17',
        winningNumbers: [3, 18, 27, 35, 41, 46],
        jackpotAmount: '98,500',
        winners: {
          jackpot: 1,
          second: 3,
          third: 22,
          fourth: 156
        },
        totalTickets: 2847
      },
      {
        id: 3,
        date: '2024-01-13',
        winningNumbers: [9, 16, 24, 33, 38, 45],
        jackpotAmount: '87,200',
        winners: {
          jackpot: 0,
          second: 1,
          third: 18,
          fourth: 94
        },
        totalTickets: 2156
      }
    ]
    setResults(mockResults)
  }, [])

  const handleRefresh = async () => {
    setLoading(true)
    // TODO: Implement smart contract call to fetch latest results
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getPrizeAmount = (result: DrawResult, tier: keyof DrawResult['winners']) => {
    const jackpot = parseFloat(result.jackpotAmount.replace(',', ''))
    const percentages = {
      jackpot: 0.6,
      second: 0.2,
      third: 0.15,
      fourth: 0.04
    }
    
    if (tier === 'jackpot' && result.winners.jackpot === 0) {
      return 'Rolled Over'
    }
    
    const amount = (jackpot * percentages[tier]) / Math.max(result.winners[tier], 1)
    return `${amount.toLocaleString()} KAS`
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
          disabled={loading}
          className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Results</span>
        </button>
      </div>

      {/* Results List */}
      <div className="space-y-6">
        {results.map((result) => (
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
                    Jackpot: {result.jackpotAmount} KAS
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

      {results.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No Results Available
          </h3>
          <p className="text-gray-500">
            Check back after the next draw for results
          </p>
        </div>
      )}
    </div>
  )
}

export default Results