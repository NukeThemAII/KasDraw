import { useState } from 'react'
import { useAccount } from 'wagmi'
import { Shuffle, Info } from 'lucide-react'
import { LOTTERY_CONFIG } from '../config/lottery'
import { useLotteryContract } from '../hooks/useLotteryContract'
import NumberGrid from '../components/NumberGrid'
import TicketSummary from '../components/TicketSummary'
import { toast } from 'sonner'

const Play = () => {
  const { isConnected } = useAccount()
  const { buyTickets, isPurchasing } = useLotteryContract()
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

    try {
      await buyTickets(tickets)
      // Clear tickets after successful purchase
      setTickets([])
      toast.success(`Successfully purchased ${tickets.length} ticket(s)!`)
    } catch (error) {
      console.error('Purchase failed:', error)
      toast.error('Failed to purchase tickets. Please try again.')
    }
  }

  const totalCost = tickets.length * parseFloat(LOTTERY_CONFIG.TICKET_PRICE)

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent mb-4">
          Play BlockDAG Lottery
        </h1>
        <p className="text-lg text-slate-600 mb-2">
          Select {LOTTERY_CONFIG.NUMBERS_PER_TICKET} Ghost numbers from {LOTTERY_CONFIG.MIN_NUMBER} to {LOTTERY_CONFIG.MAX_NUMBER}
        </p>
        <p className="text-sm text-cyan-600 mb-6">
          Powered by GhostDAG • Instant Confirmation • Parallel Processing
        </p>
        
        {/* Game Info */}
        <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4 mb-8 ghost-glow">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Info className="w-5 h-5 text-cyan-600" />
            <span className="font-semibold text-cyan-800">BlockDAG Protocol Information</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-cyan-700">
            <div>
              <span className="font-medium">Ghost Ticket Price:</span> {LOTTERY_CONFIG.TICKET_PRICE} KAS
            </div>
            <div>
              <span className="font-medium">GhostDAG Draw Days:</span> {LOTTERY_CONFIG.DRAW_DAYS.join(', ')}
            </div>
            <div>
              <span className="font-medium">Parallel Draw Time:</span> {LOTTERY_CONFIG.DRAW_TIME}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Number Selection */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-6 ghost-glow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                Select Your Ghost Numbers
              </h2>
              <button
                onClick={handleQuickPick}
                className="kaspa-button flex items-center space-x-2 px-4 py-2 text-white rounded-lg"
              >
                <Shuffle className="w-4 h-4" />
                <span>BlockDAG Quick Pick</span>
              </button>
            </div>
            
            <NumberGrid
              selectedNumbers={selectedNumbers}
              onNumberSelect={handleNumberSelect}
              maxNumbers={LOTTERY_CONFIG.MAX_NUMBER}
            />
            
            <div className="mt-6 flex justify-between items-center">
              <div className="text-sm text-cyan-600">
                Ghost Numbers Selected: {selectedNumbers.length}/{LOTTERY_CONFIG.NUMBERS_PER_TICKET}
              </div>
              <button
                onClick={handleAddTicket}
                disabled={selectedNumbers.length !== LOTTERY_CONFIG.NUMBERS_PER_TICKET}
                className="kaspa-button px-6 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add BlockDAG Ticket
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
            isPurchasing={isPurchasing}
          />
        </div>
      </div>
    </div>
  )
}

export default Play