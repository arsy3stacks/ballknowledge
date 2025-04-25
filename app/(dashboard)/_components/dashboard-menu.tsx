"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
	BarChart3,
	CalendarDays,
	Home,
	Shield,
	Trophy,
	User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
	title: string;
	href: string;
	icon: React.ReactNode;
	admin?: boolean;
}

const navItems: NavItem[] = [
	{
		title: "Dashboard",
		href: "/dashboard",
		icon: <Home className="h-5 w-5" />,
	},
	{
		title: "Fixtures",
		href: "/fixtures",
		icon: <CalendarDays className="h-5 w-5" />,
	},
	{
		title: "Predictions",
		href: "/predictions",
		icon: <BarChart3 className="h-5 w-5" />,
	},
	{
		title: "Leaderboard",
		href: "/leaderboard",
		icon: <Trophy className="h-5 w-5" />,
	},
	{
		title: "Profile",
		href: "/profile",
		icon: <User className="h-5 w-5" />,
	},
	{
		title: "Admin",
		href: "/admin",
		icon: <Shield className="h-5 w-5" />,
		admin: true,
	},
];

export function DashboardMenu({ isAdmin }: { isAdmin?: boolean }) {
	const pathname = usePathname();

	return (
		<nav className="flex flex-col space-y-2">
			{navItems
				.filter((item) => !item.admin || (item.admin && isAdmin))
				.map((item) => (
					<Link key={item.href} href={item.href}>
						<Button
							variant={pathname === item.href ? "secondary" : "ghost"}
							className={cn(
								"w-full justify-start",
								pathname === item.href ? "bg-secondary" : ""
							)}
						>
							{item.icon}
							<span className="ml-2">{item.title}</span>
						</Button>
					</Link>
				))}
		</nav>
	);
}
