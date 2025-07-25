import React, { useState, useEffect } from 'react'
import { Shuffle, Trash2, Plus, Minus } from 'lucide-react'

interface NumberSelectorV2Props {
  onTicketsChange: (tickets: number[][]) => void
  maxTickets?: number
  disabled?: boolean
}

const NumberSelectorV2: React.FC<NumberSelectorV2Props> = ({
  onTicketsChange,
  maxTickets = 10,
  disabled = false
}) => {
  const [tickets, setTickets] = useState<number[][]>([[]])
  const [activeTicketIndex, setActiveTicketIndex] = useState(0)

  const MIN_NUMBER = 1
  const MAX_NUMBER = 35
  const NUMBERS_PER_TICKET = 5

  // Generate quick pick numbers
  const generateQuickPick = (): number[] => {
    const numbers: number[] = []
    while (numbers.length < NUMBERS_PER_TICKET) {
      const num = Math.floor(Math.random() * MAX_NUMBER) + MIN_NUMBER
      if (!numbers.includes(num)) {
        numbers.push(num)
      }
    }
    return numbers.sort((a, b) => a - b)
  }

  // Update parent component when tickets change
  useEffect(() => {
    const validTickets = tickets.filter(ticket => ticket.length === NUMBERS_PER_TICKET)
    onTicketsChange(validTickets)
  }, [tickets, onTicketsChange])

  // Handle number selection
  const handleNumberSelect = (number: number) => {
    if (disabled) return

    const currentTicket = tickets[activeTicketIndex] || []
    
    if (currentTicket.includes(number)) {
      // Remove number if already selected
      const newTicket = currentTicket.filter(n => n !== number)
      updateTicket(activeTicketIndex, newTicket)
    } else if (currentTicket.length < NUMBERS_PER_TICKET) {
      // Add number if not at limit
      const newTicket = [...currentTicket, number].sort((a, b) => a - b)
      updateTicket(activeTicketIndex, newTicket)
    }
  }

  // Update specific ticket
  const updateTicket = (index: number, newTicket: number[]) => {
    const newTickets = [...tickets]
    newTickets[index] = newTicket
    setTickets(newTickets)
  }

  // Add new ticket
  const addTicket = () => {
    if (tickets.length < maxTickets) {
      setTickets([...tickets, []])
      setActiveTicketIndex(tickets.length)
    }
  }

  // Remove ticket
  const removeTicket = (index: number) => {
    if (tickets.length > 1) {
      const newTickets = tickets.filter((_, i) => i !== index)
      setTickets(newTickets)
      if (activeTicketIndex >= newTickets.length) {
        setActiveTicketIndex(newTickets.length - 1)
      }
    }
  }

  // Quick pick for current ticket
  const quickPickCurrentTicket = () => {
    if (disabled) return
    const quickPickNumbers = generateQuickPick()
    updateTicket(activeTicketIndex, quickPickNumbers)
  }

  // Quick pick all tickets
  const quickPickAllTickets = () => {
    if (disabled) return
    const newTickets = tickets.map(() => generateQuickPick())
    setTickets(newTickets)
  }

  // Clear current ticket
  const clearCurrentTicket = () => {
    if (disabled) return
    updateTicket(activeTicketIndex, [])
  }

  // Clear all tickets
  const clearAllTickets = () => {
    if (disabled) return
    setTickets([[]])
    setActiveTicketIndex(0)
  }

  const currentTicket = tickets[activeTicketIndex] || []
  const validTicketsCount = tickets.filter(ticket => ticket.length === NUMBERS_PER_TICKET).length
  const totalCost = validTicketsCount * 10 // 10 KAS per ticket

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-slate-900">
          Select Your Ghost Numbers
        </h3>
        <div className="text-right">
          <div className="text-sm text-slate-600">
            {validTicketsCount} ticket{validTicketsCount !== 1 ? 's' : ''} ready
          </div>
          <div className="text-lg font-bold text-cyan-600">
            {totalCost} KAS
          </div>
        </div>
      </div>

      {/* Ticket Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        {tickets.map((ticket, index) => (
          <button
            key={index}
            onClick={() => setActiveTicketIndex(index)}
            disabled={disabled}
            className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTicketIndex === index
                ? 'bg-cyan-500 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Ticket {index + 1}
            {ticket.length === NUMBERS_PER_TICKET && (
              <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                ✓
              </span>
            )}
          </button>
        ))}
        
        {tickets.length < maxTickets && (
          <button
            onClick={addTicket}
            disabled={disabled}
            className={`flex-shrink-0 px-4 py-2 rounded-lg border-2 border-dashed border-slate-300 text-slate-500 hover:border-cyan-500 hover:text-cyan-500 transition-colors ${
              disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Current Ticket Display */}
      <div className="bg-slate-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="font-medium text-slate-700">
            Ticket {activeTicketIndex + 1} - Select {NUMBERS_PER_TICKET} numbers
          </span>
          <div className="flex items-center space-x-2">
            {tickets.length > 1 && (
              <button
                onClick={() => removeTicket(activeTicketIndex)}
                disabled={disabled}
                className={`p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors ${
                  disabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                title="Remove this ticket"
              >
                <Minus className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 min-h-[60px] items-center">
          {currentTicket.length > 0 ? (
            currentTicket.map((number, index) => (
              <div
                key={index}
                className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg flex items-center justify-center font-bold text-lg shadow-md"
              >
                {number}
              </div>
            ))
          ) : (
            <div className="text-slate-400 italic">
              No numbers selected - click numbers below or use Quick Pick
            </div>
          )}
          
          {/* Progress indicator */}
          <div className="ml-auto text-sm text-slate-500">
            {currentTicket.length}/{NUMBERS_PER_TICKET}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={quickPickCurrentTicket}
          disabled={disabled}
          className={`flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all shadow-md ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Shuffle className="w-4 h-4" />
          <span>Quick Pick</span>
        </button>
        
        <button
          onClick={quickPickAllTickets}
          disabled={disabled}
          className={`flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-purple-600 transition-all shadow-md ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Shuffle className="w-4 h-4" />
          <span>Quick Pick All</span>
        </button>
        
        <button
          onClick={clearCurrentTicket}
          disabled={disabled}
          className={`flex items-center space-x-2 px-4 py-2 bg-slate-500 text-white rounded-lg font-medium hover:bg-slate-600 transition-colors ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear</span>
        </button>
        
        <button
          onClick={clearAllTickets}
          disabled={disabled}
          className={`flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear All</span>
        </button>
      </div>

      {/* Number Grid */}
      <div className="space-y-4">
        <h4 className="font-medium text-slate-700">
          Choose from 1 to {MAX_NUMBER}:
        </h4>
        
        <div className="grid grid-cols-7 gap-2 sm:gap-3">
          {Array.from({ length: MAX_NUMBER }, (_, i) => i + MIN_NUMBER).map((number) => {
            const isSelected = currentTicket.includes(number)
            const isDisabled = disabled || (currentTicket.length >= NUMBERS_PER_TICKET && !isSelected)
            
            return (
              <button
                key={number}
                onClick={() => handleNumberSelect(number)}
                disabled={isDisabled}
                className={`
                  w-12 h-12 rounded-lg font-bold text-lg transition-all duration-200 transform hover:scale-105
                  ${isSelected
                    ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-lg ring-2 ring-cyan-300'
                    : isDisabled
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-cyan-300 hover:bg-cyan-50 shadow-sm'
                  }
                `}
              >
                {number}
              </button>
            )
          })}
        </div>
      </div>

      {/* Summary */}
      {validTicketsCount > 0 && (
        <div className="bg-gradient-to-r from-cyan-50 to-teal-50 rounded-lg p-4 border border-cyan-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-slate-900">
                Ready to purchase: {validTicketsCount} ticket{validTicketsCount !== 1 ? 's' : ''}
              </div>
              <div className="text-sm text-slate-600">
                Each ticket costs 10 KAS • Total: {totalCost} KAS
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-cyan-600">
                {totalCost} KAS
              </div>
              <div className="text-xs text-slate-500">
                ≈ ${(totalCost * 0.15).toFixed(2)} USD
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h5 className="font-medium text-blue-900 mb-2">How to Play:</h5>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Select exactly 5 numbers from 1 to 35 for each ticket</li>
          <li>• Use Quick Pick for random number selection</li>
          <li>• Add multiple tickets to increase your chances</li>
          <li>• Match 2 or more numbers to win prizes!</li>
        </ul>
      </div>
    </div>
  )
}

export default NumberSelectorV2