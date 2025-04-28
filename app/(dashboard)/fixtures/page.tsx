"use client";

import { FixtureCard } from "@/components/fixture-card";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getMockedDate } from "@/lib/get-mocked-date";
import { Fixture } from "@/lib/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { CalendarDays, Clock, Trophy } from "lucide-react";
import { useEffect, useState } from "react";

export default function Fixtures() {
	const supabase = createClientComponentClient();
	const [loading, setLoading] = useState(true);
	const [upcomingFixtures, setUpcomingFixtures] = useState<Fixture[]>([]);
	const [liveFixtures, setLiveFixtures] = useState<Fixture[]>([]);
	const [pastFixtures, setPastFixtures] = useState<Fixture[]>([]);
	const [player, setPlayer] = useState<any>(null);

	useEffect(() => {
		const fetchData = async () => {
			try {
				// Get current user
				const {
					data: { user },
				} = await supabase.auth.getUser();
				if (!user) return;

				// Get player profile
				const { data: playerData } = await supabase
					.from("players")
					.select("*")
					.eq("auth_id", user.id)
					.single();

				setPlayer(playerData);

				// Get current date and time
				const now = new Date();
				// const now = getMockedDate();
				const today = now.toISOString().split("T")[0];
				const currentTime = now.toTimeString().split(" ")[0];

				// Fetch all fixtures
				const { data: fixturesData } = await supabase
					.from("fixtures")
					.select("*")
					.order("match_day", { ascending: true })
					.order("kickoff_time", { ascending: true });

				if (fixturesData) {
					// Filter fixtures based on status
					const upcoming: Fixture[] = [];
					const live: Fixture[] = [];
					const past: Fixture[] = [];

					fixturesData.forEach((fixture: Fixture) => {
						const fixtureDateTime = new Date(
							`${fixture.match_day}T${fixture.kickoff_time}`
						);

						if (fixtureDateTime > now) {
							upcoming.push({ ...fixture, status: "upcoming" });
						} else if (
							fixture.match_day === today &&
							!fixture.outcome &&
							fixtureDateTime <= now
						) {
							live.push({ ...fixture, status: "live" });
						} else {
							past.push({ ...fixture, status: "finished" });
						}
					});

					setUpcomingFixtures(upcoming);
					setLiveFixtures(live);
					setPastFixtures(past);
				}
			} catch (error) {
				console.error("Error fetching fixtures:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();

		// Set up interval to refresh live fixtures
		const interval = setInterval(fetchData, 60000); // Refresh every minute

		return () => clearInterval(interval);
	}, [supabase]);

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[200px]">
				Loading fixtures...
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold">Fixtures</h1>
			</div>

			<Tabs defaultValue="upcoming" className="space-y-4">
				<TabsList>
					<TabsTrigger value="upcoming" className="flex items-center gap-2">
						<CalendarDays className="h-4 w-4" />
						Upcoming
					</TabsTrigger>
					<TabsTrigger value="live" className="flex items-center gap-2">
						<Clock className="h-4 w-4" />
						Live Matches
					</TabsTrigger>
					<TabsTrigger value="past" className="flex items-center gap-2">
						<Trophy className="h-4 w-4" />
						Past Results
					</TabsTrigger>
				</TabsList>

				<TabsContent value="upcoming">
					<Card>
						<CardHeader>
							<CardTitle>Upcoming Fixtures</CardTitle>
							<CardDescription>
								Make your predictions before kickoff
							</CardDescription>
						</CardHeader>
						<CardContent>
							{upcomingFixtures.length > 0 ? (
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{upcomingFixtures.map((fixture) => (
										<FixtureCard
											key={fixture.id}
											fixture={fixture}
											playerId={player?.id || ""}
										/>
									))}
								</div>
							) : (
								<div className="text-center py-8 text-muted-foreground">
									No upcoming fixtures scheduled
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="live">
					<Card>
						<CardHeader>
							<CardTitle>Live Matches</CardTitle>
							<CardDescription>Matches currently in progress</CardDescription>
						</CardHeader>
						<CardContent>
							{liveFixtures.length > 0 ? (
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{liveFixtures.map((fixture) => (
										<FixtureCard
											key={fixture.id}
											fixture={fixture}
											playerId={player?.id || ""}
										/>
									))}
								</div>
							) : (
								<div className="text-center py-8 text-muted-foreground">
									No matches currently in progress
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="past">
					<Card>
						<CardHeader>
							<CardTitle>Past Results</CardTitle>
							<CardDescription>
								View previous match results and your predictions
							</CardDescription>
						</CardHeader>
						<CardContent>
							{pastFixtures.length > 0 ? (
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{pastFixtures.map((fixture) => (
										<FixtureCard
											key={fixture.id}
											fixture={fixture}
											playerId={player?.id || ""}
										/>
									))}
								</div>
							) : (
								<div className="text-center py-8 text-muted-foreground">
									No past fixtures available
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
