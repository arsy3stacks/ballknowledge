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

export default function Home() {
	return (
		<div className="container mx-auto px-4 space-y-12">
			{/* Header/Nav */}
			<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
					<div className="flex items-center gap-2 font-bold text-xl">
						<Link href="/" className="flex items-center gap-2">
							<Trophy className="h-6 w-6 text-chart-1" />
							<span>Ball Knowledge</span>
						</Link>
					</div>
					<div className="flex items-center gap-4">
						<Link href="/login">
							<Button variant="ghost">Login</Button>
						</Link>
						<Link href="/register">
							<Button>Sign Up</Button>
						</Link>
						<ThemeToggle />
					</div>
				</div>
			</header>

			{/* Hero */}
			<section className="container py-12 md:py-20 lg:py-24 space-y-8">
				<div className="flex flex-col items-center text-center gap-4">
					<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
						Test Your <span className="text-chart-1">Ball Knowledge</span>
					</h1>
					<p className="text-xl text-muted-foreground max-w-[700px]">
						Predict match outcomes, compete with friends, and climb the
						leaderboard in our football prediction league.
					</p>
					<div className="flex gap-4 mt-4">
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
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Calendar className="h-5 w-5 text-chart-2" /> Daily Fixtures
							</CardTitle>
							<CardDescription>
								New fixtures to predict every day
							</CardDescription>
						</CardHeader>
						<CardContent>
							<p>
								Make your predictions before kickoff and earn points for correct
								guesses.
							</p>
						</CardContent>
						<CardFooter>
							<Link
								href="/fixtures"
								className="text-chart-2 hover:underline flex items-center gap-1"
							>
								View Fixtures <ArrowRight className="h-4 w-4" />
							</Link>
						</CardFooter>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Trophy className="h-5 w-5 text-chart-1" /> Compete
							</CardTitle>
							<CardDescription>Climb the leaderboard rankings</CardDescription>
						</CardHeader>
						<CardContent>
							<p>
								Earn 3 points for each correct prediction and see how you rank
								against others.
							</p>
						</CardContent>
						<CardFooter>
							<Link
								href="/leaderboard"
								className="text-chart-1 hover:underline flex items-center gap-1"
							>
								See Leaderboard <ArrowRight className="h-4 w-4" />
							</Link>
						</CardFooter>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Users className="h-5 w-5 text-chart-3" /> Community
							</CardTitle>
							<CardDescription>Join football fans worldwide</CardDescription>
						</CardHeader>
						<CardContent>
							<p>
								Show your support for your club and represent your country on
								the global leaderboard.
							</p>
						</CardContent>
						<CardFooter>
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

			{/* How it works */}
			<section className="bg-muted py-16">
				<div className="container">
					<h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
					<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
						<div className="flex flex-col items-center text-center">
							<div className="bg-background rounded-full w-12 h-12 flex items-center justify-center mb-4 shadow-sm">
								<span className="font-bold text-lg">1</span>
							</div>
							<h3 className="font-bold mb-2">Sign Up</h3>
							<p className="text-muted-foreground">
								Create your account and set up your profile
							</p>
						</div>

						<div className="flex flex-col items-center text-center">
							<div className="bg-background rounded-full w-12 h-12 flex items-center justify-center mb-4 shadow-sm">
								<span className="font-bold text-lg">2</span>
							</div>
							<h3 className="font-bold mb-2">View Fixtures</h3>
							<p className="text-muted-foreground">
								Browse upcoming matches available for prediction
							</p>
						</div>

						<div className="flex flex-col items-center text-center">
							<div className="bg-background rounded-full w-12 h-12 flex items-center justify-center mb-4 shadow-sm">
								<span className="font-bold text-lg">3</span>
							</div>
							<h3 className="font-bold mb-2">Make Predictions</h3>
							<p className="text-muted-foreground">
								Choose home win, draw, or away win for each match
							</p>
						</div>

						<div className="flex flex-col items-center text-center">
							<div className="bg-background rounded-full w-12 h-12 flex items-center justify-center mb-4 shadow-sm">
								<span className="font-bold text-lg">4</span>
							</div>
							<h3 className="font-bold mb-2">Earn Points</h3>
							<p className="text-muted-foreground">
								Get 3 points for each correct prediction
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="border-t mt-auto">
				<div className="container py-8 flex flex-col md:flex-row justify-between items-center">
					<div className="flex items-center gap-2 font-bold text-xl mb-4 md:mb-0">
						<Trophy className="h-5 w-5 text-chart-1" />
						<span>Ball Knowledge</span>
					</div>
					<div className="text-muted-foreground text-sm">
						© {new Date().getFullYear()} Ball Knowledge. All rights reserved.
					</div>
				</div>
			</footer>
		</div>
	);
}
