"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Award, CheckCircle2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function AdminPoints() {
	const supabase = createClientComponentClient();
	const { toast } = useToast();

	const [fixtures, setFixtures] = useState<any[]>([]);
	const [predictions, setPredictions] = useState<any[]>([]);
	const [points, setPoints] = useState<any[]>([]);
	const [selectedFixture, setSelectedFixture] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	// Fetch fixtures, predictions, and points from the database
	const fetchData = async () => {
		setLoading(true);
		try {
			// Fetch fixtures
			const { data: fixturesData, error: fixturesError } = await supabase
				.from("fixtures")
				.select("*")
				.order("match_day", { ascending: true });

			if (fixturesError) throw fixturesError;

			setFixtures(fixturesData || []);

			// Fetch predictions
			const { data: predictionsData, error: predictionsError } =
				await supabase.from("predictions").select(`
                    id,
                    player_id,
                    player:players(username),
                    fixture_id,
                    predicted_outcome
                `);

			if (predictionsError) throw predictionsError;

			setPredictions(predictionsData || []);

			// Fetch points
			const { data: pointsData, error: pointsError } = await supabase
				.from("points")
				.select("*");

			if (pointsError) throw pointsError;

			setPoints(pointsData || []);
		} catch (error: any) {
			toast({
				variant: "destructive",
				title: "Error",
				description: `Failed to fetch data: ${error.message}`,
			});
		} finally {
			setLoading(false);
		}
	};

	// Assign points for the selected fixture
	const handleAssignPoints = async () => {
		if (!selectedFixture) {
			toast({
				variant: "destructive",
				title: "Error",
				description: "Please select a fixture",
			});
			return;
		}

		// Get the selected fixture details
		const currentFixture = fixtures.find(
			(fixture) => fixture.id === selectedFixture
		);

		if (!currentFixture || currentFixture.outcome === null) {
			toast({
				variant: "destructive",
				title: "Error",
				description: "Cannot assign points for a fixture without a result",
			});
			return;
		}

		setLoading(true);

		try {
			// Filter predictions for the selected fixture
			const fixturePredictions = predictions.filter(
				(prediction) => prediction.fixture_id === selectedFixture
			);

			// Assign points based on the outcome
			const pointsToInsert = fixturePredictions.map((prediction) => {
				const isCorrect =
					prediction.predicted_outcome === currentFixture.outcome;
				return {
					player_id: prediction.player_id,
					fixture_id: prediction.fixture_id,
					points_earned: isCorrect ? 3 : 0, // 3 points for correct, 0 for incorrect
					awarded_at: new Date().toISOString(),
				};
			});

			// Filter out points that are already assigned
			const newPoints = pointsToInsert.filter(
				(point) =>
					!points.some(
						(existingPoint) =>
							existingPoint.player_id === point.player_id &&
							existingPoint.fixture_id === point.fixture_id
					)
			);

			if (newPoints.length === 0) {
				toast({
					variant: "destructive",
					title: "No Points Assigned",
					description:
						"No points to assign (either already assigned or no correct predictions)",
				});
				return;
			}

			// Insert points into the database
			const { error } = await supabase.from("points").insert(newPoints);

			if (error) throw error;

			// Update the local state
			setPoints((prevPoints) => [...prevPoints, ...newPoints]);

			toast({
				title: "Success",
				description: "Points assigned successfully!",
			});
		} catch (error: any) {
			toast({
				variant: "destructive",
				title: "Error",
				description: `Failed to assign points: ${error.message}`,
			});
		} finally {
			setLoading(false);
		}
	};

	// Fetch data on component mount
	useEffect(() => {
		fetchData();
	}, []);

	// Filter predictions for the selected fixture or include all if "All fixtures" is selected
	const filteredPredictions = selectedFixture
		? predictions.filter(
				(prediction) => prediction.fixture_id === selectedFixture
		  )
		: predictions; // Include all predictions when selectedFixture is null

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Manage Points</CardTitle>
					<CardDescription>
						Assign points for completed fixtures
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="mb-6">
						<Label htmlFor="fixture-selector">Select Fixture</Label>
						<Select
							value={selectedFixture || "all"}
							onValueChange={(value) =>
								setSelectedFixture(value === "all" ? null : value)
							}
						>
							<SelectTrigger id="fixture-selector">
								<SelectValue placeholder="Select a fixture" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All fixtures</SelectItem>{" "}
								{fixtures.map((fixture) => (
									<SelectItem key={fixture.id} value={fixture.id}>
										{fixture.home_team} vs {fixture.away_team} (
										{new Date(fixture.match_day).toLocaleDateString()})
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Player</TableHead>
									<TableHead>Prediction</TableHead>
									<TableHead>Correct</TableHead>
									<TableHead>Points Earned</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredPredictions.length > 0 ? (
									filteredPredictions.map((prediction) => {
										const isCorrect =
											fixtures.find((f) => f.id === prediction.fixture_id)
												?.outcome === prediction.predicted_outcome;

										const pointsEarned = points.find(
											(point) =>
												point.player_id === prediction.player_id &&
												point.fixture_id === prediction.fixture_id
										)?.points_earned;

										return (
											<TableRow key={prediction.id}>
												<TableCell className="font-medium">
													{prediction.player.username}
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
													{isCorrect ? (
														<div className="flex items-center text-emerald-600 dark:text-emerald-400">
															<CheckCircle2 className="h-5 w-5 mr-1" />
															<span>Correct</span>
														</div>
													) : (
														<div className="flex items-center text-red-600 dark:text-red-400">
															<XCircle className="h-5 w-5 mr-1" />
															<span>Incorrect</span>
														</div>
													)}
												</TableCell>
												<TableCell>
													{pointsEarned !== undefined ? (
														<div
															className={`flex items-center ${
																pointsEarned > 0
																	? "text-emerald-600 dark:text-emerald-400"
																	: "text-red-600 dark:text-red-400"
															}`}
														>
															<CheckCircle2 className="h-5 w-5 mr-1" />
															<span>{pointsEarned} Points</span>
														</div>
													) : (
														<span className="text-muted-foreground">
															Not assigned
														</span>
													)}
												</TableCell>
											</TableRow>
										);
									})
								) : (
									<TableRow>
										<TableCell
											colSpan={4}
											className="text-center py-4 text-muted-foreground"
										>
											No predictions for this fixture
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</div>

					<div className="mt-6">
						<Button
							className="w-full"
							onClick={handleAssignPoints}
							disabled={
								loading ||
								!selectedFixture ||
								filteredPredictions.every((prediction) =>
									points.some(
										(point) =>
											point.player_id === prediction.player_id &&
											point.fixture_id === prediction.fixture_id
									)
								)
							}
						>
							<Award className="mr-2 h-4 w-4" />
							{loading ? "Assigning Points..." : "Assign Points Automatically"}
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
