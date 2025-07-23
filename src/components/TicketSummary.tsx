import { ShoppingCart, X, Wallet } from 'lucide-react'
import { LOTTERY_CONFIG } from '../config/lottery'

interface TicketSummaryProps {
  tickets: number[][]
  onRemoveTicket: (index: number) => void
  onPurchase: () => void
  totalCost: number
  isConnected: boolean
}

const TicketSummary = ({ 
  tickets, 
  onRemoveTicket, 
  onPurchase, 
  totalCost, 
  isConnected 
}: TicketSummaryProps) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
        <ShoppingCart className="w-5 h-5" />
        <span>Your Tickets</span>
      </h3>
      
      {tickets.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No tickets added yet</p>
          <p className="text-sm">Select {LOTTERY_CONFIG.NUMBERS_PER_TICKET} numbers to add a ticket</p>
        </div>
      ) : (
        <div className="space-y-3 mb-6">
          {tickets.map((ticket, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-3 flex justify-between items-center">
              <div className="flex flex-wrap gap-1">
                {ticket.map((number) => (
                  <span
                    key={number}
                    className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold"
                  >
                    {number}
                  </span>
                ))}
              </div>
              <button
                onClick={() => onRemoveTicket(index)}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      {tickets.length > 0 && (
        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600">Total Cost:</span>
            <span className="text-xl font-bold text-gray-900">
              {totalCost.toFixed(1)} KAS
            </span>
          </div>
          
          <div className="text-sm text-gray-500 mb-4">
            <div className="flex justify-between">
              <span>Tickets:</span>
              <span>{tickets.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Price per ticket:</span>
              <span>{LOTTERY_CONFIG.TICKET_PRICE} KAS</span>
            </div>
          </div>
          
          {!isConnected ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <div className="flex items-center space-x-2 text-yellow-800">
                <Wallet className="w-4 h-4" />
                <span className="text-sm">Connect your wallet to purchase tickets</span>
              </div>
            </div>
          ) : null}
          
          <button
            onClick={onPurchase}
            disabled={!isConnected || tickets.length === 0}
            className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Purchase Tickets</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default TicketSummary