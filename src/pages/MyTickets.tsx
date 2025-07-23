import React, { Suspense } from 'react'
import UserTickets from '../components/UserTickets'
import { Card, CardContent } from '../components/ui/card'
import { Ticket } from 'lucide-react'

const LoadingFallback = () => (
  <Card className="w-full max-w-4xl mx-auto lottery-ticket">
    <CardContent className="p-8 text-center blockdag-pattern">
      <div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
      <p className="text-lg text-slate-700 font-semibold">Loading your BlockDAG lottery tickets...</p>
      <p className="text-sm text-cyan-600 mt-2">Scanning the GhostDAG for your entries...</p>
    </CardContent>
  </Card>
)

const MyTickets = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent mb-4">
          My BlockDAG Tickets
        </h1>
        <p className="text-lg text-slate-600 mb-6">
          View your lottery tickets on the GhostDAG protocol and check for wins
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-cyan-600">
          <Ticket className="w-4 h-4" />
          <span>Powered by Kaspa's BlockDAG Technology</span>
        </div>
      </div>

      {/* User Tickets Component with Suspense */}
      <Suspense fallback={<LoadingFallback />}>
        <UserTickets />
      </Suspense>
    </div>
  )
}

export default MyTickets