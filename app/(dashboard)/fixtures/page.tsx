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
import { Fixture } from "@/lib/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { CalendarDays, Trophy } from "lucide-react";
import { useEffect, useState } from "react";

export default function Fixtures() {
	const supabase = createClientComponentClient();
	const [loading, setLoading] = useState(true);
	const [upcomingFixtures, setUpcomingFixtures] = useState<Fixture[]>([]);
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

				// Get today's date at midnight UTC
				const today = new Date();
				today.setUTCHours(0, 0, 0, 0);

				// Fetch upcoming fixtures
				const { data: upcomingData } = await supabase
					.from("fixtures")
					.select("*")
					.gte("match_day", today.toISOString())
					.order("match_day", { ascending: true });

				setUpcomingFixtures(upcomingData || []);

				// Fetch past fixtures
				const { data: pastData } = await supabase
					.from("fixtures")
					.select("*")
					.lt("match_day", today.toISOString())
					.order("match_day", { ascending: false })
					.limit(10);

				setPastFixtures(pastData || []);
			} catch (error) {
				console.error("Error fetching fixtures:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
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
								Make your predictions before the matches begin
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
