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
import { format } from "date-fns";
import { CheckCircle2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

export default function Predictions() {
	const supabase = createClientComponentClient();
	const [loading, setLoading] = useState(true);
	const [predictions, setPredictions] = useState<any[]>([]);
	const [stats, setStats] = useState({
		total: 0,
		correct: 0,
		points: 0,
	});

	useEffect(() => {
		const fetchPredictions = async () => {
			try {
				// Get current user's player profile
				const {
					data: { user },
				} = await supabase.auth.getUser();
				if (!user) return;

				const { data: playerData } = await supabase
					.from("players")
					.select("id")
					.eq("auth_id", user.id)
					.single();

				if (!playerData) return;

				// First, fetch predictions with fixture details
				const { data: predictionsData } = await supabase
					.from("predictions")
					.select(
						`
            id,
            predicted_outcome,
            submitted_at,
            fixture:fixtures (
              id,
              match_day,
              home_team,
              away_team,
              outcome
            )
          `
					)
					.eq("player_id", playerData.id)
					.order("submitted_at", { ascending: false });

				// Then, fetch points separately and merge them
				const { data: pointsData } = await supabase
					.from("points")
					.select("fixture_id, points_earned")
					.eq("player_id", playerData.id);

				// Create a map of fixture_id to points_earned
				const pointsMap = new Map(
					pointsData?.map((p) => [p.fixture_id, p.points_earned]) || []
				);

				// Merge predictions with points
				const processedPredictions = predictionsData?.map((pred) => ({
					...pred,
					points_earned:
						pred.fixture.outcome === null
							? "-" // Set "-" for pending predictions
							: pointsMap.get(pred.fixture.id) ?? 0, // Default to 0 for incorrect predictions
				}));

				if (processedPredictions) {
					setPredictions(processedPredictions);

					// Calculate stats
					const total = processedPredictions.length;
					const correct = processedPredictions.filter(
						(p) => p.predicted_outcome === p.fixture.outcome
					).length;
					const points = Array.from(pointsMap.values()).reduce(
						(sum, points) => sum + points,
						0
					);

					setStats({
						total,
						correct,
						points,
					});
				}
			} catch (error) {
				console.error("Error fetching predictions:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchPredictions();
	}, [supabase]);

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[200px]">
				Loading predictions...
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold">Your Predictions</h1>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">
							Total Predictions
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.total}</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">
							Correct Predictions
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.correct}</div>
						<p className="text-xs text-muted-foreground">
							{((stats.correct / stats.total) * 100 || 0).toFixed(1)}% accuracy
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">Points Earned</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.points}</div>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Prediction History</CardTitle>
					<CardDescription>
						View all your past predictions and their outcomes
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Date</TableHead>
								<TableHead>Fixture</TableHead>
								<TableHead>Your Prediction</TableHead>
								<TableHead>Result</TableHead>
								<TableHead className="text-right">Points</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{predictions.map((prediction) => (
								<TableRow key={prediction.id}>
									<TableCell>
										{format(
											new Date(prediction.fixture.match_day),
											"MMM d, yyyy"
										)}
									</TableCell>
									<TableCell>
										{prediction.fixture.home_team} vs{" "}
										{prediction.fixture.away_team}
									</TableCell>
									<TableCell>
										<div
											className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-white font-medium ${
												prediction.predicted_outcome === "H"
													? "bg-chart-1"
													: prediction.predicted_outcome === "D"
													? "bg-chart-2"
													: "bg-chart-3"
											}`}
										>
											{prediction.predicted_outcome}
										</div>
									</TableCell>
									<TableCell>
										{prediction.fixture.outcome ? (
											prediction.predicted_outcome ===
											prediction.fixture.outcome ? (
												<div className="flex items-center text-emerald-600 dark:text-emerald-400">
													<CheckCircle2 className="h-5 w-5 mr-1" />
													Correct
												</div>
											) : (
												<div className="flex items-center text-red-600 dark:text-red-400">
													<XCircle className="h-5 w-5 mr-1" />
													Incorrect
												</div>
											)
										) : (
											<span className="text-muted-foreground">Pending</span>
										)}
									</TableCell>
									<TableCell className="text-right">
										{prediction.points_earned !== null &&
										prediction.points_earned !== undefined
											? prediction.points_earned
											: "-"}
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
