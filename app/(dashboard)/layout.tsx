"use client";

import { DashboardMenu } from "@/app/(dashboard)/_components/dashboard-menu";
import { DashboardNavbar } from "@/app/(dashboard)/_components/dashboard-navbar";
import { Player } from "@/lib/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const router = useRouter();
	const supabase = createClientComponentClient();
	const [user, setUser] = useState<any>(null);
	const [player, setPlayer] = useState<Player | null>(null);
	const [loading, setLoading] = useState(true);

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
				const { data: playerData } = await supabase
					.from("players")
					.select("*")
					.eq("auth_id", userData.user.id)
					.single();

				setPlayer(playerData as Player);
			}

			setLoading(false);
		};

		checkUser();
	}, [supabase, router]);

	const handleSignOut = async () => {
		await supabase.auth.signOut();
		router.push("/");
	};

	if (loading) {
		return (
			<div className="flex h-screen items-center justify-center">
				Loading...
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			<DashboardNavbar user={user} player={player} onSignOut={handleSignOut} />
			<div className="container grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 py-8">
				<DashboardMenu />
				<main>{children}</main>
			</div>
		</div>
	);
}
