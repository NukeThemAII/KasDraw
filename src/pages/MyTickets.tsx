import React from 'react'
import UserTickets from '../components/UserTickets'

const MyTickets = () => {

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
      </div>

      {/* User Tickets Component */}
      <UserTickets />
    </div>
  )
}

export default MyTickets