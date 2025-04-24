"use client";

import { FixtureCard } from "@/components/fixture-card";
import { LeaderboardPreview } from "@/components/leaderboard-preview";
import { PlayerStats } from "@/components/player-stats";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Fixture, Player, Prediction } from "@/lib/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { CalendarDays } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Dashboard() {
	const router = useRouter();
	const supabase = createClientComponentClient();
	const [loading, setLoading] = useState(true);
	const [user, setUser] = useState<any>(null);
	const [player, setPlayer] = useState<Player | null>(null);
	const [upcomingFixtures, setUpcomingFixtures] = useState<Fixture[]>([]);
	const [recentPredictions, setRecentPredictions] = useState<
		(Prediction & { fixture: Fixture })[]
	>([]);

	useEffect(() => {
		const checkUser = async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (!session) {
				router.push("/login");
				return;
			}

			const { data: userData } = await supabase.auth.getUser();
			setUser(userData.user);

			if (userData.user) {
				// Fetch player profile
				const { data: playerData } = await supabase
					.from("players")
					.select("*")
					.eq("auth_id", userData.user.id)
					.single();

				setPlayer(playerData as Player);

				// Fetch upcoming fixtures
				const today = new Date().toISOString().split("T")[0];
				const { data: fixturesData } = await supabase
					.from("fixtures")
					.select("*")
					.gte("match_day", today)
					.order("match_day", { ascending: true })
					.limit(5);

				setUpcomingFixtures(fixturesData as Fixture[]);

				// Fetch recent predictions with fixture details
				if (playerData) {
					const { data: predictionsData } = await supabase
						.from("predictions")
						.select(
							`
              *,
              fixture:fixtures(*)
            `
						)
						.eq("player_id", playerData.id)
						.order("submitted_at", { ascending: false })
						.limit(5);

					setRecentPredictions(predictionsData as any);
				}
			}

			setLoading(false);
		};

		checkUser();
	}, [supabase, router]);

	if (loading) {
		return (
			<div className="flex h-screen items-center justify-center">
				Loading...
			</div>
		);
	}

	return (
		<main className="space-y-6">
			<h1 className="text-3xl font-bold">Welcome, {player?.username}</h1>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<PlayerStats player={player} />
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<CalendarDays className="h-5 w-5 text-chart-2" /> Upcoming
							Fixtures
						</CardTitle>
						<CardDescription>
							Make your predictions before kickoff
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{upcomingFixtures.length > 0 ? (
							upcomingFixtures.map((fixture) => (
								<FixtureCard
									key={fixture.id}
									fixture={fixture}
									playerId={player?.id || ""}
								/>
							))
						) : (
							<p className="text-muted-foreground text-center py-4">
								No upcoming fixtures
							</p>
						)}
					</CardContent>
					<CardFooter>
						<Link href="/fixtures" className="w-full">
							<Button variant="outline" className="w-full">
								View All Fixtures
							</Button>
						</Link>
					</CardFooter>
				</Card>

				<LeaderboardPreview playerId={player?.id || ""} />
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Recent Predictions</CardTitle>
					<CardDescription>Your most recent match predictions</CardDescription>
				</CardHeader>
				<CardContent>
					{recentPredictions.length > 0 ? (
						<div className="space-y-4">
							{recentPredictions.map((prediction) => (
								<div
									key={prediction.id}
									className="flex items-center justify-between border-b pb-3"
								>
									<div>
										<p className="font-medium">
											{prediction.fixture.home_team} vs{" "}
											{prediction.fixture.away_team}
										</p>
										<p className="text-sm text-muted-foreground">
											{new Date(
												prediction.fixture.match_day
											).toLocaleDateString()}
										</p>
									</div>
									<div className="bg-muted px-3 py-1 rounded-full text-sm">
										{prediction.predicted_outcome === "H"
											? "Home Win"
											: prediction.predicted_outcome === "A"
											? "Away Win"
											: "Draw"}
									</div>
								</div>
							))}
						</div>
					) : (
						<p className="text-muted-foreground text-center py-4">
							No predictions made yet
						</p>
					)}
				</CardContent>
				<CardFooter>
					<Link href="/predictions" className="w-full">
						<Button variant="outline" className="w-full">
							View All Predictions
						</Button>
					</Link>
				</CardFooter>
			</Card>
		</main>
	);
}
