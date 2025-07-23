import { ShoppingCart, X, Wallet, Loader2 } from 'lucide-react'
import { LOTTERY_CONFIG } from '../config/lottery'

interface TicketSummaryProps {
  tickets: number[][]
  onRemoveTicket: (index: number) => void
  onPurchase: () => void
  totalCost: number
  isConnected: boolean
  isPurchasing?: boolean
}

const TicketSummary = ({ 
  tickets, 
  onRemoveTicket, 
  onPurchase, 
  totalCost, 
  isConnected,
  isPurchasing = false
}: TicketSummaryProps) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8 ghost-glow">
      <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center space-x-2">
        <ShoppingCart className="w-5 h-5 text-cyan-600" />
        <span>Your BlockDAG Tickets</span>
      </h3>
      
      {tickets.length === 0 ? (
        <div className="text-center py-8 text-cyan-500">
          <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No Ghost tickets added yet</p>
          <p className="text-sm">Select {LOTTERY_CONFIG.NUMBERS_PER_TICKET} numbers to add a BlockDAG ticket</p>
        </div>
      ) : (
        <div className="space-y-3 mb-6">
          {tickets.map((ticket, index) => (
            <div key={index} className="lottery-ticket bg-cyan-50 rounded-lg p-3 flex justify-between items-center">
              <div className="flex flex-wrap gap-1">
                {ticket.map((number) => (
                  <span
                    key={number}
                    className="kaspa-number w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-semibold"
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
        <div className="border-t border-cyan-200 pt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-cyan-600">Total BlockDAG Cost:</span>
            <span className="text-xl font-bold text-slate-900">
              {totalCost.toFixed(1)} KAS
            </span>
          </div>
          
          <div className="text-sm text-cyan-500 mb-4">
            <div className="flex justify-between">
              <span>Ghost Tickets:</span>
              <span>{tickets.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Price per ticket:</span>
              <span>{LOTTERY_CONFIG.TICKET_PRICE} KAS</span>
            </div>
          </div>
          
          {!isConnected ? (
            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3 mb-4">
              <div className="flex items-center space-x-2 text-cyan-800">
                <Wallet className="w-4 h-4" />
                <span className="text-sm">Connect your Kasplex wallet to purchase Ghost tickets</span>
              </div>
            </div>
          ) : null}
          
          <button
            onClick={onPurchase}
            disabled={!isConnected || tickets.length === 0 || isPurchasing}
            className="kaspa-button w-full py-3 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isPurchasing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing BlockDAG...</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5" />
                <span>Purchase Ghost Tickets</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

export default TicketSummary