"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { ArrowRight, Trophy } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

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
			try {
				// Fetch players and their total points
				const { data, error } = await supabase.from("players").select(
					`
            id,
            username,
            club_supported,
            points (
              points_earned
            )
          `
				);

				if (error) {
					console.error("Error fetching leaderboard:", error);
					return;
				}

				if (data) {
					// Calculate total points for each player
					const leaderboardData = data.map((player) => {
						const totalPoints = player.points
							? player.points.reduce(
									(sum: number, point: { points_earned: number }) =>
										sum + point.points_earned,
									0
							  )
							: 0;

						return {
							id: player.id,
							username: player.username,
							total_points: totalPoints,
							position: 0, // Will be updated after sorting
							club_supported: player.club_supported,
						};
					});

					// Sort by total points
					leaderboardData.sort((a, b) => b.total_points - a.total_points);

					// Assign positions
					leaderboardData.forEach((player, index) => {
						player.position = index + 1;
					});

					// Set leaderboard state
					setLeaderboard(leaderboardData.slice(0, 5)); // Limit to top 5 players

					// Find the current user's rank
					const currentUser = leaderboardData.find((p) => p.id === playerId);
					if (currentUser) {
						setUserRank(currentUser);
					}
				}
			} catch (error) {
				console.error("Error fetching leaderboard:", error);
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
								<div
									className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
										player.position === 1
											? "bg-chart-1 text-white"
											: player.position === 2
											? "bg-chart-2 text-white"
											: player.position === 3
											? "bg-chart-3 text-white"
											: "bg-muted"
									}`}
								>
									{player.position}
								</div>
								<div>
									<p className="font-medium">{player.username}</p>
									<p className="text-xs text-muted-foreground">
										{player.club_supported}
									</p>
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
