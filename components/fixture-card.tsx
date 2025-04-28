"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getMockedDate } from "@/lib/get-mocked-date";
import { Fixture, PredictionOutcome } from "@/lib/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { format } from "date-fns";
import { AlertCircle, Ban, CheckCircle2, Clock, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface FixtureCardProps {
	fixture: Fixture;
	playerId: string;
}

export function FixtureCard({ fixture, playerId }: FixtureCardProps) {
	const supabase = createClientComponentClient();
	const [selectedOutcome, setSelectedOutcome] =
		useState<PredictionOutcome | null>(null);
	const [existingPrediction, setExistingPrediction] =
		useState<PredictionOutcome | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSuspended, setIsSuspended] = useState(false);

	useEffect(() => {
		const checkUserStatus = async () => {
			if (!playerId) return;

			// Check for existing prediction
			const { data: predictionData } = await supabase
				.from("predictions")
				.select("predicted_outcome")
				.eq("player_id", playerId)
				.eq("fixture_id", fixture.id)
				.single();

			if (predictionData) {
				setExistingPrediction(
					predictionData.predicted_outcome as PredictionOutcome
				);
				setSelectedOutcome(
					predictionData.predicted_outcome as PredictionOutcome
				);
			}

			// Check if user is suspended
			const { data: playerData } = await supabase
				.from("players")
				.select("is_suspended")
				.eq("id", playerId)
				.single();

			if (playerData) {
				setIsSuspended(playerData.is_suspended);
			}
		};

		checkUserStatus();
	}, [playerId, fixture.id, supabase]);

	const handlePrediction = async () => {
		if (!selectedOutcome || !playerId) return;

		setIsSubmitting(true);

		try {
			if (existingPrediction) {
				// Update existing prediction
				const { error } = await supabase
					.from("predictions")
					.update({
						predicted_outcome: selectedOutcome,
						submitted_at: new Date().toISOString(),
					})
					.eq("player_id", playerId)
					.eq("fixture_id", fixture.id);

				if (error) throw error;

				setExistingPrediction(selectedOutcome);
				toast.success("Prediction updated successfully!");
			} else {
				// Create new prediction
				const { error } = await supabase.from("predictions").insert([
					{
						player_id: playerId,
						fixture_id: fixture.id,
						predicted_outcome: selectedOutcome,
						submitted_at: new Date().toISOString(),
					},
				]);

				if (error) {
					if (
						error.message.includes("Suspended users cannot make predictions")
					) {
						toast.error(
							"You are currently suspended and cannot make predictions."
						);
						setIsSuspended(true);
						return;
					}
					throw error;
				}

				setExistingPrediction(selectedOutcome);
				toast.success("Prediction submitted successfully!");
			}
		} catch (error) {
			toast.error("Failed to submit prediction. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	const matchDate = new Date(`${fixture.match_day}T${fixture.kickoff_time}`);
	const formattedDate = format(matchDate, "EEE, MMM d");
	const formattedTime = format(matchDate, "HH:mm");
	// const deadlinePassed = new Date() > matchDate;
	const deadlinePassed = getMockedDate() > matchDate;

	const getFixtureStatus = () => {
		if (fixture.status === "finished") {
			if (!existingPrediction) {
				return {
					text: "No Prediction Made",
					icon: <AlertCircle className="h-4 w-4 mr-1" />,
					color: "text-amber-500 dark:text-amber-400",
				};
			}
			const isCorrect = existingPrediction === fixture.outcome;
			return {
				text: isCorrect ? "Correct Prediction" : "Incorrect Prediction",
				icon: isCorrect ? (
					<CheckCircle2 className="h-4 w-4 mr-1" />
				) : (
					<XCircle className="h-4 w-4 mr-1" />
				),
				color: isCorrect
					? "text-emerald-600 dark:text-emerald-400"
					: "text-red-600 dark:text-red-400",
			};
		}

		if (fixture.status === "live") {
			return {
				text: "Match In Progress",
				icon: <Clock className="h-4 w-4 mr-1" />,
				color: "text-blue-600 dark:text-blue-400",
			};
		}

		if (deadlinePassed) {
			return {
				text: "Deadline Passed",
				icon: <AlertCircle className="h-4 w-4 mr-1" />,
				color: "text-amber-500 dark:text-amber-400",
			};
		}

		if (existingPrediction) {
			return {
				text: "Prediction Made",
				icon: <CheckCircle2 className="h-4 w-4 mr-1" />,
				color: "text-emerald-600 dark:text-emerald-400",
			};
		}

		return {
			text: "Awaiting Prediction",
			icon: <Clock className="h-4 w-4 mr-1" />,
			color: "text-blue-600 dark:text-blue-400",
		};
	};

	if (isSuspended) {
		return (
			<Card className="p-4 bg-destructive/5 border-destructive">
				<div className="flex flex-col space-y-3">
					<div className="flex items-center justify-between">
						<div className="text-sm text-muted-foreground">
							{formattedDate} at {formattedTime}
						</div>
						<div className="flex items-center text-sm text-destructive">
							<Ban className="h-4 w-4 mr-1" />
							Account Suspended
						</div>
					</div>

					<div className="grid grid-cols-3 items-center gap-2 py-2">
						<div className="text-center font-medium">{fixture.home_team}</div>
						<div className="text-center text-muted-foreground text-sm">vs</div>
						<div className="text-center font-medium">{fixture.away_team}</div>
					</div>

					<div className="text-sm text-destructive text-center">
						Your account has been suspended. You cannot make predictions at this
						time.
					</div>
				</div>
			</Card>
		);
	}

	const status = getFixtureStatus();

	return (
		<Card className="p-4 hover:shadow-md transition-shadow">
			<div className="flex flex-col space-y-3">
				<div className="flex justify-between items-center">
					<div className="text-sm text-muted-foreground">
						{formattedDate} at {formattedTime}
					</div>
					<div className={`flex items-center text-sm ${status.color}`}>
						{status.icon}
						{status.text}
					</div>
				</div>

				<div className="grid grid-cols-3 items-center gap-2 py-2">
					<div className="text-center font-medium">{fixture.home_team}</div>
					<div className="text-center text-muted-foreground text-sm">vs</div>
					<div className="text-center font-medium">{fixture.away_team}</div>
				</div>

				{/* Show user's prediction for live and past fixtures */}
				{(fixture.status === "live" || fixture.status === "finished") &&
					existingPrediction && (
						<div className="text-center text-sm text-primary">
							Your Prediction:{" "}
							{existingPrediction === "H"
								? "Home Win"
								: existingPrediction === "A"
								? "Away Win"
								: "Draw"}
						</div>
					)}

				{/* Prediction buttons for upcoming fixtures */}
				{fixture.status === "upcoming" && !deadlinePassed && (
					<>
						<div className="grid grid-cols-3 gap-2">
							<Button
								variant={selectedOutcome === "H" ? "default" : "outline"}
								size="sm"
								onClick={() => setSelectedOutcome("H")}
								className={selectedOutcome === "H" ? "bg-chart-1" : ""}
							>
								Home Win
							</Button>
							<Button
								variant={selectedOutcome === "D" ? "default" : "outline"}
								size="sm"
								onClick={() => setSelectedOutcome("D")}
								className={selectedOutcome === "D" ? "bg-chart-2" : ""}
							>
								Draw
							</Button>
							<Button
								variant={selectedOutcome === "A" ? "default" : "outline"}
								size="sm"
								onClick={() => setSelectedOutcome("A")}
								className={selectedOutcome === "A" ? "bg-chart-3" : ""}
							>
								Away Win
							</Button>
						</div>

						<Button
							onClick={handlePrediction}
							disabled={
								!selectedOutcome ||
								isSubmitting ||
								selectedOutcome === existingPrediction
							}
							size="sm"
						>
							{isSubmitting
								? "Submitting..."
								: existingPrediction
								? "Update Prediction"
								: "Submit Prediction"}
						</Button>
					</>
				)}

				{/* Show match result for finished fixtures */}
				{fixture.status === "finished" && fixture.outcome && (
					<div className="bg-secondary p-2 rounded text-center">
						Result:{" "}
						{fixture.outcome === "H"
							? "Home Win"
							: fixture.outcome === "A"
							? "Away Win"
							: "Draw"}
					</div>
				)}
			</div>
		</Card>
	);
}
