"use client";

import { AdminFixtures } from "@/app/(dashboard)/_components/admin-fixtures";
import { AdminPoints } from "@/app/(dashboard)/_components/admin-points";
import { AdminSubmissions } from "@/app/(dashboard)/_components/admin-submissions";
import { AdminUsers } from "@/app/(dashboard)/_components/admin-users";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { CalendarDays, ClipboardCheck, Shield, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
	const supabase = createClientComponentClient();
	const router = useRouter();

	// State to store admin status the fetched data
	const [isAdmin, setIsAdmin] = useState<boolean | null>(null); // null indicates loading
	const [totalFixtures, setTotalFixtures] = useState<number>(0);
	const [pendingFixtures, setPendingFixtures] = useState<number>(0);
	const [activePlayers, setActivePlayers] = useState<number>(0);
	const [suspendedPlayers, setSuspendedPlayers] = useState<number>(0);
	const [totalPredictions, setTotalPredictions] = useState<number>(0);
	const [upcomingPredictions, setUpcomingPredictions] = useState<number>(0);
	const [playersSignedUpThisWeek, setPlayersSignedUpThisWeek] =
		useState<number>(0);
	const [adminCount, setAdminCount] = useState<number>(0);

	// Fetch data from the database
	const fetchData = async () => {
		try {
			// Check if the user is an admin
			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (!session) {
				router.push("/login"); // Redirect to login if not authenticated
				return;
			}

			const { data: userData, error: userError } = await supabase
				.from("players")
				.select("is_admin")
				.eq("auth_id", session.user.id)
				.single();

			if (userError || !userData?.is_admin) {
				router.push("/dashboard"); // Redirect non-admins to the main dashboard
				return;
			}

			setIsAdmin(true); // User is an admin

			// Fetch total fixtures and pending fixtures
			const { data: fixturesData, error: fixturesError } = await supabase
				.from("fixtures")
				.select("*");

			if (fixturesError) throw fixturesError;

			setTotalFixtures(fixturesData.length);
			setPendingFixtures(
				fixturesData.filter((fixture) => fixture.outcome === null).length
			);

			// Fetch active and suspended players
			const { data: playersData, error: playersError } = await supabase
				.from("players")
				.select("*");

			if (playersError) throw playersError;

			setActivePlayers(
				playersData.filter((player) => !player.is_suspended).length
			);

			const oneWeekAgo = new Date();
			oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

			setPlayersSignedUpThisWeek(
				playersData.filter((player) => new Date(player.joined_at) >= oneWeekAgo)
					.length
			);

			setSuspendedPlayers(
				playersData.filter((player) => player.is_suspended).length
			);

			setAdminCount(playersData.filter((player) => player.is_admin).length);

			// Fetch total predictions and predictions for upcoming fixtures
			const { data: predictionsData, error: predictionsError } = await supabase
				.from("predictions")
				.select("id, fixture:fixtures(outcome)");

			if (predictionsError) throw predictionsError;

			setTotalPredictions(predictionsData.length);
			setUpcomingPredictions(
				predictionsData.filter(
					(prediction) => prediction.fixture?.outcome === null
				).length
			);
		} catch (error: any) {
			console.error("Failed to fetch data:", error.message);
		}
	};

	// Fetch data on component mount
	useEffect(() => {
		fetchData();
	}, []);

	// Show a loading state while checking admin status
	if (isAdmin === null) {
		return <p>Loading...</p>;
	}

	return (
		<main className="space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-3xl font-bold">Admin Dashboard</h1>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium flex items-center">
							<CalendarDays className="h-4 w-4 text-chart-1 mr-2" />
							Total Fixtures
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{totalFixtures}</div>
						<p className="text-xs text-muted-foreground">
							{pendingFixtures} pending fixtures
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium flex items-center">
							<ClipboardCheck className="h-4 w-4 text-chart-3 mr-2" />
							Predictions
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{totalPredictions}</div>
						<p className="text-xs text-muted-foreground">
							{upcomingPredictions} for upcoming fixtures
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium flex items-center">
							<Users className="h-4 w-4 text-chart-2 mr-2" />
							Active Players
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{activePlayers}</div>
						<p className="text-xs text-muted-foreground">
							{playersSignedUpThisWeek} signed up this week
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium flex items-center">
							<Shield className="h-4 w-4 text-chart-4 mr-2" />
							Admin Users
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{adminCount}</div>
						<p className="text-xs text-muted-foreground">
							{suspendedPlayers} suspended players
						</p>
					</CardContent>
				</Card>
			</div>

			<Tabs defaultValue="fixtures">
				<TabsList>
					<TabsTrigger value="fixtures">Manage Fixtures</TabsTrigger>
					<TabsTrigger value="submissions">View Submissions</TabsTrigger>
					<TabsTrigger value="points">Assign Points</TabsTrigger>
					<TabsTrigger value="users">Manage Users</TabsTrigger>
				</TabsList>
				<TabsContent value="fixtures" className="mt-6">
					<AdminFixtures />
				</TabsContent>
				<TabsContent value="submissions" className="mt-6">
					<AdminSubmissions />
				</TabsContent>
				<TabsContent value="points" className="mt-6">
					<AdminPoints />
				</TabsContent>
				<TabsContent value="users" className="mt-6">
					<AdminUsers />
				</TabsContent>
			</Tabs>
		</main>
	);
}
