"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

export function AdminSubmissions() {
	const supabase = createClientComponentClient();
	const { toast } = useToast();

	const [submissions, setSubmissions] = useState<any[]>([]);
	const [selectedFixture, setSelectedFixture] = useState<string | undefined>(
		undefined
	);
	const [searchQuery, setSearchQuery] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	// Fetch predictions from the database
	const fetchSubmissions = async () => {
		setIsLoading(true);

		try {
			const { data, error } = await supabase.from("predictions").select(`
				id,
				predicted_outcome,
				submitted_at,
				player:players(username),
				fixture:fixtures(home_team, away_team, match_day)
	`);

			if (error) throw error;

			setSubmissions(data || []);
		} catch (error: any) {
			toast({
				variant: "destructive",
				title: "Error",
				description: `Failed to fetch submissions: ${error.message}`,
			});
		} finally {
			setIsLoading(false);
		}
	};

	// Fetch submissions on component mount
	useEffect(() => {
		fetchSubmissions();
	}, []);

	// Filter submissions based on fixture and search query
	const filteredSubmissions = submissions.filter((submission) => {
		const matchesFixture =
			!selectedFixture ||
			`${submission.fixture.home_team}-${submission.fixture.away_team}-${submission.fixture.match_day}` ===
				selectedFixture;
		const matchesSearch =
			!searchQuery ||
			submission.player.username
				.toLowerCase()
				.includes(searchQuery.toLowerCase());

		return matchesFixture && matchesSearch;
	});

	// Get unique fixtures for the filter dropdown
	const uniqueFixtures = Array.from(
		new Map(
			submissions.map((submission) => [
				`${submission.fixture.home_team}-${submission.fixture.away_team}-${submission.fixture.match_day}`, // Composite key
				submission.fixture, // Store the full fixture object
			])
		).values()
	);

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Player Predictions</CardTitle>
					<CardDescription>
						View and filter all submitted predictions
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col md:flex-row gap-4 mb-6">
						<div className="w-full md:w-1/2">
							<Label htmlFor="fixture-filter">Filter by Fixture</Label>
							<Select
								value={selectedFixture || "all"}
								onValueChange={(value) =>
									setSelectedFixture(value === "all" ? undefined : value)
								}
							>
								<SelectTrigger id="fixture-filter">
									<SelectValue placeholder="All fixtures" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All fixtures</SelectItem>
									{uniqueFixtures.map((fixture) => (
										<SelectItem
											key={`${fixture.home_team}-${fixture.away_team}-${fixture.match_day}`}
											value={`${fixture.home_team}-${fixture.away_team}-${fixture.match_day}`}
										>
											{fixture.home_team} vs {fixture.away_team} (
											{new Date(fixture.match_day).toLocaleDateString()})
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="w-full md:w-1/2">
							<Label htmlFor="search-players">Search Players</Label>
							<div className="relative">
								<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
								<Input
									id="search-players"
									placeholder="Search by username"
									className="pl-8"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
								/>
							</div>
						</div>
					</div>

					<div className="rounded-md border">
						{isLoading ? (
							<div className="text-center py-4">Loading submissions...</div>
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Player</TableHead>
										<TableHead>Fixture</TableHead>
										<TableHead>Match Day</TableHead>
										<TableHead>Prediction</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredSubmissions.length > 0 ? (
										filteredSubmissions.map((submission) => (
											<TableRow key={submission.id}>
												<TableCell className="font-medium">
													{submission.player.username}
												</TableCell>
												<TableCell>
													{submission.fixture.home_team} vs.{" "}
													{submission.fixture.away_team}
												</TableCell>
												<TableCell>
													{new Date(
														submission.fixture.match_day
													).toLocaleDateString()}
												</TableCell>
												<TableCell>
													<div
														className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-white font-medium ${
															submission.predicted_outcome === "H"
																? "bg-chart-1"
																: submission.predicted_outcome === "D"
																? "bg-chart-2"
																: "bg-chart-3"
														}`}
													>
														{submission.predicted_outcome}
													</div>
												</TableCell>
											</TableRow>
										))
									) : (
										<TableRow>
											<TableCell
												colSpan={4}
												className="text-center py-4 text-muted-foreground"
											>
												No predictions match your filters
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						)}
					</div>

					<div className="mt-4 text-sm text-muted-foreground">
						Showing {filteredSubmissions.length} of {submissions.length}{" "}
						predictions
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
