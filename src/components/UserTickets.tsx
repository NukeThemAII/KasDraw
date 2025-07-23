import React from 'react';
import { useLotteryContract } from '../hooks/useLotteryContract';
import { useUserTickets } from '../hooks/useUserTickets';
import { useLatestDraw } from '../hooks/useDrawResults';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Ticket, Trophy, Clock, CheckCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export const UserTickets: React.FC = () => {
  const { claimTicketPrize, isClaiming } = useLotteryContract();
  const { userTickets, loading, error, stats, hasTickets, isConnected } = useUserTickets();
  const { latestDraw } = useLatestDraw();

  const handleClaimPrize = async (ticketId: number) => {
    try {
      await claimTicketPrize(ticketId);
      toast.success('Prize claimed successfully!');
    } catch (error) {
      console.error('Error claiming prize:', error);
      toast.error('Failed to claim prize');
    }
  };

  const getMatchBadgeColor = (matches: number) => {
    if (matches >= 6) return 'bg-yellow-500 text-white';
    if (matches >= 5) return 'bg-purple-500 text-white';
    if (matches >= 4) return 'bg-blue-500 text-white';
    if (matches >= 3) return 'bg-green-500 text-white';
    return 'bg-gray-500 text-white';
  };

  const getPrizeText = (matches: number) => {
    if (matches >= 6) return 'JACKPOT!';
    if (matches >= 5) return '2nd Prize';
    if (matches >= 4) return '3rd Prize';
    if (matches >= 3) return '4th Prize';
    return 'No Prize';
  };

  if (!isConnected) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8 text-center">
          <Ticket className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-lg text-gray-600">Connect your wallet to view your tickets</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto lottery-ticket">
        <CardContent className="p-8 text-center blockdag-pattern">
          <div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg text-slate-700 font-semibold">Loading your BlockDAG lottery tickets...</p>
          <p className="text-sm text-cyan-600 mt-2">Scanning the GhostDAG for your entries...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-4xl mx-auto lottery-ticket">
        <CardContent className="p-8 text-center">
          <div className="text-red-500 mb-4">
            <RefreshCw className="w-16 h-16 mx-auto mb-4" />
          </div>
          <p className="text-lg text-slate-700 font-semibold mb-2">BlockDAG Connection Error</p>
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="kaspa-button"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh GhostDAG Connection
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (userTickets.length === 0) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8 text-center">
          <Ticket className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-lg text-gray-600 mb-4">You don't have any tickets yet</p>
          <p className="text-sm text-gray-500">Purchase tickets to participate in the lottery!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="w-6 h-6" />
            Your Lottery Tickets ({userTickets.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {userTickets.map((ticket) => (
              <Card key={ticket.id} className={`lottery-ticket transition-all duration-300 ${
                ticket.isWinner ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50 ghost-glow' : 'hover:border-cyan-400'
              }`}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">
                      Ticket #{ticket.id}
                    </span>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        Draw #{ticket.drawId}
                      </Badge>
                      {ticket.isWinner && (
                        <Badge className="text-xs bg-green-500 text-white">
                          Winner!
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Ticket Numbers */}
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Your Numbers:</p>
                    <div className="flex flex-wrap gap-2">
                      {ticket.numbers.map((number, index) => {
                         const isWinningNumber = latestDraw?.winningNumbers.includes(number) && 
                                               ticket.drawId === latestDraw.id;
                         return (
                           <div
                             key={index}
                             className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                               isWinningNumber 
                                 ? 'kaspa-winning-number' 
                                 : 'kaspa-number'
                             }`}
                           >
                             {number}
                           </div>
                         );
                       })}
                    </div>
                  </div>

                  {/* Match Status */}
                  {latestDraw && latestDraw.executed && ticket.drawId === latestDraw.id ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Matches:</span>
                        <Badge className={getMatchBadgeColor(ticket.matches || 0)}>
                          {ticket.matches || 0} matches
                        </Badge>
                      </div>
                      
                      {ticket.isWinner && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Prize:</span>
                          <span className="text-sm font-bold text-green-600">
                            {ticket.prizeType}
                          </span>
                        </div>
                      )}

                      {ticket.prizeAmount && parseFloat(ticket.prizeAmount) > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Amount:</span>
                          <span className="text-sm font-bold text-blue-600">
                            {parseFloat(ticket.prizeAmount).toFixed(4)} KAS
                          </span>
                        </div>
                      )}

                      {/* Claim Button */}
                      {ticket.canClaim && !ticket.claimed && (
                        <Button
                          onClick={() => handleClaimPrize(ticket.id)}
                          disabled={isClaiming}
                          className="w-full kaspa-button"
                          size="sm"
                        >
                          <Trophy className="w-4 h-4 mr-2" />
                          {isClaiming ? 'Claiming Ghost Reward...' : 'Claim BlockDAG Prize'}
                        </Button>
                      )}

                      {ticket.claimed && (
                        <div className="flex items-center justify-center gap-2 text-green-600 text-sm">
                          <CheckCircle className="w-4 h-4" />
                          Prize Claimed
                        </div>
                      )}

                      {!ticket.isWinner && (
                        <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
                          <span>No prize this time</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <Clock className="w-4 h-4" />
                      {ticket.drawId === (latestDraw?.id || 0) + 1 ? 'Waiting for draw results' : 'Draw completed'}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Your Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-turquoise">{stats.totalTickets}</p>
              <p className="text-sm text-gray-600">Total Tickets</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.winningTickets}</p>
              <p className="text-sm text-gray-600">Winning Tickets</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats.claimedTickets}</p>
              <p className="text-sm text-gray-600">Prizes Claimed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{stats.pendingClaims}</p>
              <p className="text-sm text-gray-600">Pending Claims</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {parseFloat(stats.totalWinnings).toFixed(4)}
              </p>
              <p className="text-sm text-gray-600">Total Winnings (KAS)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserTickets;