"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { format } from "date-fns";
import { CalendarDays, CircleX, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

// Mock teams for the demo
// Allow admin to type in any team name in the input field
const teams = [
	"Arsenal",
	"Aston Villa",
	"Bournemouth",
	"Brentford",
	"Brighton",
	"Chelsea",
	"Crystal Palace",
	"Everton",
	"Fulham",
	"Leeds United",
	"Leicester City",
	"Liverpool",
	"Manchester City",
	"Manchester United",
	"Newcastle United",
	"Nottingham Forest",
	"Southampton",
	"Tottenham",
	"West Ham",
	"Wolves",
];

export function AdminFixtures() {
	const supabase = createClientComponentClient();
	const { toast } = useToast();

	const [fixtures, setFixtures] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [date, setDate] = useState<Date>(new Date());
	const [kickoffTime, setKickoffTime] = useState<string>("15:00"); // Default kickoff time
	const [newFixture, setNewFixture] = useState({
		match_day: format(new Date(), "yyyy-MM-dd"),
		kickoff_time: "15:00", // Default kickoff time
		home_team: "",
		away_team: "",
	});

	// Fetch fixtures from the database
	const fetchFixtures = async () => {
		setIsLoading(true);

		try {
			const { data, error } = await supabase
				.from("fixtures")
				.select("*")
				.order("match_day", { ascending: true });

			if (error) throw error;

			setFixtures(data || []);
		} catch (error: any) {
			toast({
				variant: "destructive",
				title: "Error",
				description: `Failed to fetch fixtures: ${error.message}`,
			});
		} finally {
			setIsLoading(false);
		}
	};

	// Add a new fixture to the database
	const handleAddFixture = async () => {
		if (
			!newFixture.home_team ||
			!newFixture.away_team ||
			!newFixture.match_day ||
			!newFixture.kickoff_time
		) {
			toast({
				variant: "destructive",
				title: "Error",
				description: "Please fill in all fixture details",
			});
			return;
		}

		if (newFixture.home_team === newFixture.away_team) {
			toast({
				variant: "destructive",
				title: "Error",
				description: "Home and away teams cannot be the same",
			});
			return;
		}

		setIsLoading(true);

		try {
			const { data, error } = await supabase
				.from("fixtures")
				.insert([
					{
						match_day: newFixture.match_day,
						kickoff_time: newFixture.kickoff_time,
						home_team: newFixture.home_team,
						away_team: newFixture.away_team,
						outcome: null,
						created_at: new Date().toISOString(),
					},
				])
				.select();

			if (error) throw error;

			// Add the new fixture to the list and sort by ascending date
			setFixtures((prevFixtures) =>
				[...prevFixtures, data[0]].sort(
					(a, b) =>
						new Date(a.match_day).getTime() - new Date(b.match_day).getTime()
				)
			);

			// Reset form
			setNewFixture({
				match_day: format(new Date(), "yyyy-MM-dd"),
				kickoff_time: "15:00",
				home_team: "",
				away_team: "",
			});
			setDate(new Date());
			setKickoffTime("15:00");

			toast({
				title: "Success",
				description: "Fixture added successfully",
			});
		} catch (error: any) {
			toast({
				variant: "destructive",
				title: "Error",
				description: `Failed to add fixture: ${error.message}`,
			});
		} finally {
			setIsLoading(false);
		}
	};

	// Update a fixture's outcome in the database
	const handleUpdateFixture = async (
		fixtureId: string,
		outcome: string | null
	) => {
		setIsLoading(true);

		try {
			const { error } = await supabase
				.from("fixtures")
				.update({ outcome })
				.eq("id", fixtureId);

			if (error) throw error;

			toast({
				title: "Success",
				description:
					outcome === null
						? "Fixture result cleared successfully"
						: "Fixture outcome updated successfully",
			});
		} catch (error: any) {
			toast({
				variant: "destructive",
				title: "Error",
				description: `Failed to update fixture: ${error.message}`,
			});
		} finally {
			setIsLoading(false);
		}
	};

	// Delete a fixture from the database
	const handleDeleteFixture = async (fixtureId: string) => {
		setIsLoading(true);

		try {
			const { error } = await supabase
				.from("fixtures")
				.delete()
				.eq("id", fixtureId);

			if (error) throw error;

			// Remove the fixture from the list
			setFixtures(fixtures.filter((fixture) => fixture.id !== fixtureId));
			toast({
				title: "Success",
				description: "Fixture deleted successfully",
			});
		} catch (error: any) {
			toast({
				variant: "destructive",
				title: "Error",
				description: `Failed to delete fixture: ${error.message}`,
			});
		} finally {
			setIsLoading(false);
		}
	};

	// Fetch fixtures on component mount
	useEffect(() => {
		fetchFixtures();
	}, []);

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Add New Fixture</CardTitle>
					<CardDescription>
						Create a new match for players to predict
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
						{/* Match Date */}
						<div className="space-y-2">
							<Label>Match Date</Label>
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant={"outline"}
										className={cn(
											"w-full justify-start text-left font-normal",
											!date && "text-muted-foreground"
										)}
									>
										<CalendarDays className="mr-2 h-4 w-4" />
										{date ? format(date, "PPP") : <span>Pick a date</span>}
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0" align="start">
									<Calendar
										mode="single"
										selected={date}
										onSelect={(newDate) => {
											setDate(newDate || new Date());
											setNewFixture({
												...newFixture,
												match_day: format(newDate || new Date(), "yyyy-MM-dd"),
											});
										}}
										initialFocus
									/>
								</PopoverContent>
							</Popover>
						</div>

						{/* Kickoff Time */}
						<div className="space-y-2">
							<Label htmlFor="kickoff-time">Kickoff Time</Label>
							<Input
								id="kickoff-time"
								type="time"
								value={kickoffTime}
								onChange={(e) => {
									setKickoffTime(e.target.value);
									setNewFixture({
										...newFixture,
										kickoff_time: e.target.value,
									});
								}}
							/>
						</div>

						{/* Home Team */}
						<div className="space-y-2">
							<Label htmlFor="home-team">Home Team</Label>
							<Select
								value={newFixture.home_team}
								onValueChange={(value) =>
									setNewFixture({ ...newFixture, home_team: value })
								}
							>
								<SelectTrigger id="home-team">
									<SelectValue placeholder="Select home team" />
								</SelectTrigger>
								<SelectContent>
									{teams.map((team) => (
										<SelectItem key={team} value={team}>
											{team}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Away Team */}
						<div className="space-y-2">
							<Label htmlFor="away-team">Away Team</Label>
							<Select
								value={newFixture.away_team}
								onValueChange={(value) =>
									setNewFixture({ ...newFixture, away_team: value })
								}
							>
								<SelectTrigger id="away-team">
									<SelectValue placeholder="Select away team" />
								</SelectTrigger>
								<SelectContent>
									{teams.map((team) => (
										<SelectItem key={team} value={team}>
											{team}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
				</CardContent>
				<CardFooter>
					<Button
						className="w-full"
						onClick={handleAddFixture}
						disabled={isLoading}
					>
						<Plus className="mr-2 h-4 w-4" />
						{isLoading ? "Adding..." : "Add Fixture"}
					</Button>
				</CardFooter>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Upcoming Fixtures</CardTitle>
					<CardDescription>Manage scheduled matches</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{fixtures.map((fixture) => (
							<div
								key={fixture.id}
								className="flex items-center justify-between border-b pb-3 last:border-b-0"
							>
								<div className="flex items-center gap-4">
									<div className="bg-muted p-2 rounded">
										<CalendarDays className="h-5 w-5 text-muted-foreground" />
									</div>
									<div>
										<p className="font-medium">
											{fixture.home_team} vs {fixture.away_team}
										</p>
										<p className="text-sm text-muted-foreground">
											{new Date(fixture.match_day).toLocaleDateString("en-US", {
												weekday: "short",
												year: "numeric",
												month: "short",
												day: "numeric",
											})}
										</p>
									</div>
								</div>
								<div className="flex gap-2">
									<Select
										value={fixture.outcome || ""}
										onValueChange={(value) => {
											// Update the outcome in the local state
											setFixtures((prevFixtures) =>
												prevFixtures.map((currFixture) =>
													currFixture.id === fixture.id
														? {
																...currFixture,
																outcome: value === "" ? null : value,
														  }
														: currFixture
												)
											);
										}}
									>
										<SelectTrigger className="w-28">
											<SelectValue placeholder="..." />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="H">Home Win</SelectItem>
											<SelectItem value="D">Draw</SelectItem>
											<SelectItem value="A">Away Win</SelectItem>
										</SelectContent>
									</Select>
									<Button
										variant="outline"
										size="icon"
										onClick={() => {
											// Clear the outcome in the local state
											setFixtures((prevFixtures) =>
												prevFixtures.map((currFixture) =>
													currFixture.id === fixture.id
														? { ...currFixture, outcome: null }
														: currFixture
												)
											);
										}}
										disabled={isLoading}
									>
										<CircleX className="h-4 w-4" />
									</Button>
									<Button
										variant="outline"
										size="icon"
										onClick={() =>
											handleUpdateFixture(
												fixture.id,
												fixture.outcome === "" ? null : fixture.outcome
											)
										}
										disabled={isLoading}
									>
										<Save className="h-4 w-4" />
									</Button>
									<Button
										variant="destructive"
										size="icon"
										onClick={() => handleDeleteFixture(fixture.id)}
										disabled={isLoading}
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
