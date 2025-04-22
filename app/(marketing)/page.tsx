import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ArrowRight, Calendar, Trophy, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
	return (
		<>
			{/* Hero */}
			<section className="container mx-auto min-h-screen flex items-center justify-center text-center text-balance flex-col gap-8 px-4 sm:px-6 lg:px-8 pt-8 sm:pt-20 md:pt-24 mb-12 sm:mb-16 md:mb-24">
				<h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
					Test Your <span className="text-chart-1">Ball Knowledge</span>
				</h1>
				<p className="text-lg sm:text-xl text-muted-foreground max-w-[700px]">
					Predict match outcomes, compete with friends, and climb the
					leaderboard in our football prediction league.
				</p>
				<div className="flex flex-col sm:flex-row gap-4 mt-4">
					<Link href="/register">
						<Button size="lg" className="gap-2">
							Join Now <ArrowRight className="h-4 w-4" />
						</Button>
					</Link>
					<Link href="/leaderboard">
						<Button size="lg" variant="outline" className="gap-2">
							View Leaderboard <Trophy className="h-4 w-4" />
						</Button>
					</Link>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12 px-4 sm:px-6 lg:px-8">
					<Card className="flex flex-col h-full">
						<CardHeader className="text-left">
							<CardTitle className="flex items-center gap-2">
								<Calendar className="h-5 w-5 text-chart-2" /> Daily Fixtures
							</CardTitle>
							<CardDescription className="text-left">
								New fixtures to predict every day
							</CardDescription>
						</CardHeader>
						<CardContent className="text-left">
							<p>
								Make your predictions before kickoff and earn points for correct
								guesses.
							</p>
						</CardContent>
						<CardFooter className="mt-auto">
							<Link
								href="/fixtures"
								className="text-chart-2 hover:underline flex items-center gap-1"
							>
								View Fixtures <ArrowRight className="h-4 w-4" />
							</Link>
						</CardFooter>
					</Card>

					<Card className="flex flex-col h-full">
						<CardHeader className="text-left">
							<CardTitle className="flex items-center gap-2">
								<Trophy className="h-5 w-5 text-chart-1" /> Compete
							</CardTitle>
							<CardDescription>Climb the leaderboard rankings</CardDescription>
						</CardHeader>
						<CardContent className="text-left">
							<p>
								Earn 3 points for each correct prediction and see how you rank
								against others.
							</p>
						</CardContent>
						<CardFooter className="mt-auto">
							<Link
								href="/leaderboard"
								className="text-chart-1 hover:underline flex items-center gap-1"
							>
								See Leaderboard <ArrowRight className="h-4 w-4" />
							</Link>
						</CardFooter>
					</Card>

					<Card className="flex flex-col h-full">
						<CardHeader className="text-left">
							<CardTitle className="flex items-center gap-2">
								<Users className="h-5 w-5 text-chart-3" /> Community
							</CardTitle>
							<CardDescription>Join football fans worldwide</CardDescription>
						</CardHeader>
						<CardContent className="text-left">
							<p>
								Show your support for your club and represent your country on
								the global leaderboard.
							</p>
						</CardContent>
						<CardFooter className="mt-auto">
							<Link
								href="/register"
								className="text-chart-3 hover:underline flex items-center gap-1"
							>
								Join Community <ArrowRight className="h-4 w-4" />
							</Link>
						</CardFooter>
					</Card>
				</div>
			</section>

			{/* Footer */}
			<footer className="border-t mt-auto bg-background">
				<div className="container mx-auto py-8 flex flex-col md:flex-row justify-between items-center gap-4 px-4 sm:px-6 lg:px-8">
					<div className="flex items-center gap-2 font-bold text-xl">
						<Trophy className="h-5 w-5 text-chart-1" />
						<span>Ball Knowledge</span>
					</div>
					<div className="text-muted-foreground text-sm text-center md:text-right">
						© {new Date().getFullYear()} Ball Knowledge. All rights reserved.
					</div>
				</div>
			</footer>
		</>
	);
}
