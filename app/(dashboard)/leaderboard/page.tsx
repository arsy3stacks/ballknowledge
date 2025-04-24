"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Medal, Trophy } from "lucide-react";
import { useEffect, useState } from "react";

interface LeaderboardPlayer {
	id: string;
	username: string;
	club_supported: string;
	total_points: number;
	correct_predictions: number;
	position: number;
}

export default function Leaderboard() {
	const supabase = createClientComponentClient();
	const [loading, setLoading] = useState(true);
	const [players, setPlayers] = useState<LeaderboardPlayer[]>([]);
	const [currentPlayer, setCurrentPlayer] = useState<string | null>(null);

	useEffect(() => {
		const fetchLeaderboard = async () => {
			try {
				// Get current user
				const {
					data: { user },
				} = await supabase.auth.getUser();
				if (user) {
					const { data: playerData } = await supabase
						.from("players")
						.select("id")
						.eq("auth_id", user.id)
						.single();

					if (playerData) {
						setCurrentPlayer(playerData.id);
					}
				}

				// Fetch all players with their points
				const { data: playersData } = await supabase.from("players").select(`
            id,
            username,
            club_supported,
            points (
              points_earned
            )
          `);

				if (playersData) {
					// Calculate total points and sort players
					const processedPlayers = playersData
						.map((player: any) => ({
							id: player.id,
							username: player.username,
							club_supported: player.club_supported,
							total_points:
								player.points?.reduce(
									(sum: number, p: any) => sum + p.points_earned,
									0
								) || 0,
							correct_predictions:
								player.points?.filter((p: any) => p.points_earned === 3)
									.length || 0,
							position: 0,
						}))
						.sort((a, b) => b.total_points - a.total_points)
						.map((player, index) => ({
							...player,
							position: index + 1,
						}));

					setPlayers(processedPlayers);
				}
			} catch (error) {
				console.error("Error fetching leaderboard:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchLeaderboard();
	}, [supabase]);

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[200px]">
				Loading leaderboard...
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold">Leaderboard</h1>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				{players.slice(0, 3).map((player, index) => (
					<Card key={player.id} className={index === 0 ? "border-chart-1" : ""}>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								{index === 0 ? (
									<Trophy className="h-5 w-5 text-chart-1" />
								) : (
									<Medal
										className={`h-5 w-5 ${
											index === 1 ? "text-chart-2" : "text-chart-3"
										}`}
									/>
								)}
								{player.username}
							</CardTitle>
							<CardDescription>{player.club_supported}</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{player.total_points} pts
							</div>
							<p className="text-sm text-muted-foreground">
								{player.correct_predictions} correct predictions
							</p>
						</CardContent>
					</Card>
				))}
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Full Rankings</CardTitle>
					<CardDescription>
						See how you compare against other players
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-16">Rank</TableHead>
								<TableHead>Player</TableHead>
								<TableHead>Club</TableHead>
								<TableHead className="text-right">Correct</TableHead>
								<TableHead className="text-right">Points</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{players.map((player) => (
								<TableRow
									key={player.id}
									className={player.id === currentPlayer ? "bg-muted" : ""}
								>
									<TableCell className="font-medium">
										{player.position}
									</TableCell>
									<TableCell>{player.username}</TableCell>
									<TableCell>{player.club_supported}</TableCell>
									<TableCell className="text-right">
										{player.correct_predictions}
									</TableCell>
									<TableCell className="text-right font-bold">
										{player.total_points}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}
