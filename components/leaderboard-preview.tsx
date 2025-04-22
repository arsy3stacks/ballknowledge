"use client"

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import { Trophy, ArrowRight } from "lucide-react";

interface LeaderboardPlayer {
  id: string;
  username: string;
  total_points: number;
  position: number;
  club_supported: string;
}

interface LeaderboardPreviewProps {
  playerId: string;
}

export function LeaderboardPreview({ playerId }: LeaderboardPreviewProps) {
  const supabase = createClientComponentClient();
  const [leaderboard, setLeaderboard] = useState<LeaderboardPlayer[]>([]);
  const [userRank, setUserRank] = useState<LeaderboardPlayer | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      // This is a simplified version - in a real app, you'd use a more sophisticated query
      // that joins the players table with a sum of points from the points table
      
      // For demonstration, we'll create a mock query result
      const { data } = await supabase
        .from('players')
        .select(`
          id,
          username,
          club_supported
        `)
        .limit(5);
      
      if (data) {
        // This is mock data - in a real app, you'd get actual points from the database
        const mockLeaderboard = data.map((player, index) => ({
          id: player.id,
          username: player.username,
          total_points: 100 - (index * 12) + Math.floor(Math.random() * 10),
          position: index + 1,
          club_supported: player.club_supported
        }));
        
        // Sort by points
        mockLeaderboard.sort((a, b) => b.total_points - a.total_points);
        
        // Update positions after sorting
        mockLeaderboard.forEach((player, index) => {
          player.position = index + 1;
        });
        
        setLeaderboard(mockLeaderboard);
        
        // Find user's rank
        const currentUser = mockLeaderboard.find(p => p.id === playerId);
        if (currentUser) {
          setUserRank(currentUser);
        }
      }
    };
    
    fetchLeaderboard();
  }, [playerId, supabase]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-chart-1" /> Leaderboard
        </CardTitle>
        <CardDescription>Current top performers</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {leaderboard.map((player) => (
            <div 
              key={player.id} 
              className={`flex items-center justify-between p-2 rounded-md ${
                player.id === playerId ? "bg-secondary" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                  player.position === 1 ? "bg-chart-1 text-white" :
                  player.position === 2 ? "bg-chart-2 text-white" :
                  player.position === 3 ? "bg-chart-3 text-white" :
                  "bg-muted"
                }`}>
                  {player.position}
                </div>
                <div>
                  <p className="font-medium">{player.username}</p>
                  <p className="text-xs text-muted-foreground">{player.club_supported}</p>
                </div>
              </div>
              <div className="font-bold">{player.total_points}</div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        {userRank && (
          <div className="w-full p-2 bg-muted rounded-md flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                {userRank.position}
              </div>
              <div>
                <p className="font-medium">Your Position</p>
              </div>
            </div>
            <div className="font-bold">{userRank.total_points}</div>
          </div>
        )}
        <Link href="/leaderboard" className="w-full">
          <Button variant="outline" className="w-full flex items-center gap-2">
            View Full Leaderboard <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}