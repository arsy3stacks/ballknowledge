import { Trophy } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";

export function LandingHeader() {
	return (
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
	);
}
