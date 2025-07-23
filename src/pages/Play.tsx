import { useState } from 'react'
import { useAccount } from 'wagmi'
import { Shuffle, ShoppingCart, Info } from 'lucide-react'
import { LOTTERY_CONFIG } from '../config/lottery'
import NumberGrid from '../components/NumberGrid'
import TicketSummary from '../components/TicketSummary'
import { toast } from 'sonner'

const Play = () => {
  const { isConnected } = useAccount()
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([])
  const [tickets, setTickets] = useState<number[][]>([])

  const handleNumberSelect = (number: number) => {
    if (selectedNumbers.includes(number)) {
      setSelectedNumbers(selectedNumbers.filter(n => n !== number))
    } else if (selectedNumbers.length < LOTTERY_CONFIG.NUMBERS_PER_TICKET) {
      setSelectedNumbers([...selectedNumbers, number])
    } else {
      toast.error(`You can only select ${LOTTERY_CONFIG.NUMBERS_PER_TICKET} numbers per ticket`)
    }
  }

  const handleQuickPick = () => {
    const numbers: number[] = []
    while (numbers.length < LOTTERY_CONFIG.NUMBERS_PER_TICKET) {
      const randomNum = Math.floor(Math.random() * LOTTERY_CONFIG.MAX_NUMBER) + 1
      if (!numbers.includes(randomNum)) {
        numbers.push(randomNum)
      }
    }
    setSelectedNumbers(numbers.sort((a, b) => a - b))
  }

  const handleAddTicket = () => {
    if (selectedNumbers.length === LOTTERY_CONFIG.NUMBERS_PER_TICKET) {
      setTickets([...tickets, [...selectedNumbers]])
      setSelectedNumbers([])
      toast.success('Ticket added!')
    } else {
      toast.error(`Please select exactly ${LOTTERY_CONFIG.NUMBERS_PER_TICKET} numbers`)
    }
  }

  const handleRemoveTicket = (index: number) => {
    setTickets(tickets.filter((_, i) => i !== index))
    toast.success('Ticket removed')
  }

  const handlePurchaseTickets = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first')
      return
    }
    
    if (tickets.length === 0) {
      toast.error('Please add at least one ticket')
      return
    }

    // TODO: Implement smart contract interaction
    toast.success(`Purchasing ${tickets.length} ticket(s)...`)
  }

  const totalCost = tickets.length * parseFloat(LOTTERY_CONFIG.TICKET_PRICE)

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Play KasDraw Lottery
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Select {LOTTERY_CONFIG.NUMBERS_PER_TICKET} numbers from {LOTTERY_CONFIG.MIN_NUMBER} to {LOTTERY_CONFIG.MAX_NUMBER}
        </p>
        
        {/* Game Info */}
        <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4 mb-8">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Info className="w-5 h-5 text-cyan-600" />
            <span className="font-semibold text-cyan-800">Game Information</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-cyan-700">
            <div>
              <span className="font-medium">Ticket Price:</span> {LOTTERY_CONFIG.TICKET_PRICE} KAS
            </div>
            <div>
              <span className="font-medium">Draw Days:</span> {LOTTERY_CONFIG.DRAW_DAYS.join(', ')}
            </div>
            <div>
              <span className="font-medium">Draw Time:</span> {LOTTERY_CONFIG.DRAW_TIME}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Number Selection */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Select Your Numbers
              </h2>
              <button
                onClick={handleQuickPick}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-colors"
              >
                <Shuffle className="w-4 h-4" />
                <span>Quick Pick</span>
              </button>
            </div>
            
            <NumberGrid
              selectedNumbers={selectedNumbers}
              onNumberSelect={handleNumberSelect}
              maxNumbers={LOTTERY_CONFIG.MAX_NUMBER}
            />
            
            <div className="mt-6 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Selected: {selectedNumbers.length}/{LOTTERY_CONFIG.NUMBERS_PER_TICKET}
              </div>
              <button
                onClick={handleAddTicket}
                disabled={selectedNumbers.length !== LOTTERY_CONFIG.NUMBERS_PER_TICKET}
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Ticket
              </button>
            </div>
          </div>
        </div>

        {/* Ticket Summary */}
        <div className="lg:col-span-1">
          <TicketSummary
            tickets={tickets}
            onRemoveTicket={handleRemoveTicket}
            onPurchase={handlePurchaseTickets}
            totalCost={totalCost}
            isConnected={isConnected}
          />
        </div>
      </div>
    </div>
  )
}

export default Play