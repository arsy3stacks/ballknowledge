"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Player } from "@/lib/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Percent, Target, Trophy } from "lucide-react";
import { useEffect, useState } from "react";

interface PlayerStatsProps {
	player: Player | null;
}

export function PlayerStats({ player }: PlayerStatsProps) {
	const supabase = createClientComponentClient();
	const [totalPoints, setTotalPoints] = useState(0);
	const [totalPredictions, setTotalPredictions] = useState(0);
	const [correctPredictions, setCorrectPredictions] = useState(0);

	useEffect(() => {
		const fetchStats = async () => {
			if (!player) return;

			// Get total points
			const { data: pointsData } = await supabase
				.from("points")
				.select("points_earned")
				.eq("player_id", player.id);

			if (pointsData) {
				const total = pointsData.reduce(
					(sum, record) => sum + record.points_earned,
					0
				);
				setTotalPoints(total);
			}

			// Get total predictions
			const { count: predictionsCount } = await supabase
				.from("predictions")
				.select("*", { count: "exact", head: true })
				.eq("player_id", player.id);

			setTotalPredictions(predictionsCount || 0);

			// Get correct predictions (points earned = 3)
			const { count: correctCount } = await supabase
				.from("points")
				.select("*", { count: "exact", head: true })
				.eq("player_id", player.id)
				.eq("points_earned", 3);

			setCorrectPredictions(correctCount || 0);
		};

		fetchStats();
	}, [player, supabase]);

	// Calculate accuracy
	const accuracy =
		totalPredictions > 0
			? Math.round((correctPredictions / totalPredictions) * 100)
			: 0;

	return (
		<>
			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-sm font-medium flex items-center">
						<Trophy className="h-4 w-4 text-chart-1 mr-2" />
						Total Points
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{totalPoints}</div>
					<p className="text-xs text-muted-foreground">
						Earned from correct predictions
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-sm font-medium flex items-center">
						<Target className="h-4 w-4 text-chart-2 mr-2" />
						Predictions Made
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{totalPredictions}</div>
					<p className="text-xs text-muted-foreground">
						{correctPredictions} correct predictions
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-sm font-medium flex items-center">
						<Percent className="h-4 w-4 text-chart-3 mr-2" />
						Accuracy
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{accuracy}%</div>
					<p className="text-xs text-muted-foreground">
						{totalPredictions === 0
							? "No predictions yet"
							: `${correctPredictions} out of ${totalPredictions}`}
					</p>
				</CardContent>
			</Card>
		</>
	);
}
