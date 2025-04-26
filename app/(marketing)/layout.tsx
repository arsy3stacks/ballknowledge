"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import { AuthenticatedHeader } from "./_components/authenticated-header";
import { MarketingHeader } from "./_components/marketing-header";

export default function MarketingLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const supabase = createClientComponentClient();
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const checkSession = async () => {
			const { data: sessionData } = await supabase.auth.getSession();
			setIsAuthenticated(!!sessionData?.session);
			setLoading(false);
		};

		checkSession();

		// Listen for auth state changes
		const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
			if (event === "SIGNED_OUT") {
				setIsAuthenticated(false); // Update state on logout
			}
			if (event === "SIGNED_IN") {
				setIsAuthenticated(true); // Update state on login
			}
		});

		return () => {
			authListener?.subscription.unsubscribe();
		};
	}, [supabase]);

	if (loading) {
		return null; // Avoid rendering while checking session
	}

	return (
		<div>
			{isAuthenticated ? <AuthenticatedHeader /> : <MarketingHeader />}
			{children}
		</div>
	);
}
