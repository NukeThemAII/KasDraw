import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Ticket, Trophy, Clock, Wallet, RefreshCw, CheckCircle, XCircle } from 'lucide-react'
import { LOTTERY_CONFIG } from '../config/lottery'

interface UserTicket {
  id: string
  drawId: number
  numbers: number[]
  purchaseDate: string
  drawDate: string
  status: 'pending' | 'drawn' | 'claimed'
  matches?: number
  prize?: string
  isWinner?: boolean
}

const MyTickets = () => {
  const { address, isConnected } = useAccount()
  const [tickets, setTickets] = useState<UserTicket[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'pending' | 'winners' | 'claimed'>('all')

  // Mock data for demonstration
  useEffect(() => {
    if (isConnected && address) {
      const mockTickets: UserTicket[] = [
        {
          id: '1',
          drawId: 1,
          numbers: [7, 14, 23, 31, 42, 48],
          purchaseDate: '2024-01-19',
          drawDate: '2024-01-20',
          status: 'drawn',
          matches: 4,
          prize: '125.5 KAS',
          isWinner: true
        },
        {
          id: '2',
          drawId: 1,
          numbers: [3, 18, 27, 35, 41, 46],
          purchaseDate: '2024-01-19',
          drawDate: '2024-01-20',
          status: 'drawn',
          matches: 2,
          isWinner: false
        },
        {
          id: '3',
          drawId: 2,
          numbers: [9, 16, 24, 33, 38, 45],
          purchaseDate: '2024-01-22',
          drawDate: '2024-01-24',
          status: 'pending'
        }
      ]
      setTickets(mockTickets)
    }
  }, [isConnected, address])

  const handleRefresh = async () => {
    setLoading(true)
    // TODO: Implement smart contract call to fetch user tickets
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }

  const handleClaimPrize = async (ticketId: string) => {
    // TODO: Implement smart contract call to claim prize
    setTickets(tickets.map(ticket => 
      ticket.id === ticketId 
        ? { ...ticket, status: 'claimed' as const }
        : ticket
    ))
  }

  const filteredTickets = tickets.filter(ticket => {
    switch (filter) {
      case 'pending':
        return ticket.status === 'pending'
      case 'winners':
        return ticket.isWinner
      case 'claimed':
        return ticket.status === 'claimed'
      default:
        return true
    }
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusIcon = (ticket: UserTicket) => {
    if (ticket.status === 'pending') {
      return <Clock className="w-5 h-5 text-yellow-500" />
    }
    if (ticket.isWinner) {
      return <Trophy className="w-5 h-5 text-yellow-500" />
    }
    return <XCircle className="w-5 h-5 text-gray-400" />
  }

  const getStatusText = (ticket: UserTicket) => {
    if (ticket.status === 'pending') {
      return 'Pending Draw'
    }
    if (ticket.status === 'claimed') {
      return 'Prize Claimed'
    }
    if (ticket.isWinner) {
      return `Winner! ${ticket.matches} matches`
    }
    return `${ticket.matches || 0} matches`
  }

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Connect Your Wallet
        </h2>
        <p className="text-gray-600">
          Please connect your wallet to view your lottery tickets
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          My Tickets
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          View your lottery tickets and check for wins
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Tickets</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap justify-center space-x-2">
        {[
          { key: 'all', label: 'All Tickets' },
          { key: 'pending', label: 'Pending' },
          { key: 'winners', label: 'Winners' },
          { key: 'claimed', label: 'Claimed' }
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === key
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tickets List */}
      {filteredTickets.length > 0 ? (
        <div className="space-y-4">
          {filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${
                ticket.isWinner
                  ? 'border-yellow-400'
                  : ticket.status === 'pending'
                  ? 'border-blue-400'
                  : 'border-gray-300'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                {/* Ticket Info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <Ticket className="w-6 h-6 text-cyan-500" />
                    <span className="text-lg font-semibold text-gray-900">
                      Draw #{ticket.drawId}
                    </span>
                    {getStatusIcon(ticket)}
                    <span className="text-sm text-gray-600">
                      {getStatusText(ticket)}
                    </span>
                  </div>
                  
                  {/* Numbers */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {ticket.numbers.map((number, index) => (
                      <span
                        key={index}
                        className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold"
                      >
                        {number}
                      </span>
                    ))}
                  </div>
                  
                  {/* Dates */}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Purchased:</span> {formatDate(ticket.purchaseDate)}
                    </div>
                    <div>
                      <span className="font-medium">Draw Date:</span> {formatDate(ticket.drawDate)}
                    </div>
                  </div>
                </div>

                {/* Prize Info */}
                {ticket.isWinner && (
                  <div className="lg:text-right">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Trophy className="w-5 h-5" />
                        <span className="font-semibold">Winner!</span>
                      </div>
                      <div className="text-2xl font-bold mb-2">
                        {ticket.prize}
                      </div>
                      {ticket.status !== 'claimed' && (
                        <button
                          onClick={() => handleClaimPrize(ticket.id)}
                          className="w-full px-4 py-2 bg-white text-orange-500 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                        >
                          Claim Prize
                        </button>
                      )}
                      {ticket.status === 'claimed' && (
                        <div className="flex items-center space-x-2 text-green-100">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm">Claimed</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            {filter === 'all' ? 'No Tickets Found' : `No ${filter} tickets`}
          </h3>
          <p className="text-gray-500 mb-6">
            {filter === 'all' 
              ? 'You haven\'t purchased any lottery tickets yet'
              : `You don't have any ${filter} tickets`
            }
          </p>
          {filter === 'all' && (
            <a
              href="/play"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-colors"
            >
              <Ticket className="w-5 h-5" />
              <span>Buy Your First Ticket</span>
            </a>
          )}
        </div>
      )}
    </div>
  )
}

export default MyTickets