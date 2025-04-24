"use client";

import { AdminFixtures } from "@/app/(dashboard)/_components/admin-fixtures";
import { AdminPoints } from "@/app/(dashboard)/_components/admin-points";
import { AdminSubmissions } from "@/app/(dashboard)/_components/admin-submissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { CalendarDays, ClipboardCheck, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminDashboard() {
	const router = useRouter();
	const supabase = createClientComponentClient();

	return (
		<main className="space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-3xl font-bold">Admin Dashboard</h1>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium flex items-center">
							<CalendarDays className="h-4 w-4 text-chart-1 mr-2" />
							Total Fixtures
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">28</div>
						<p className="text-xs text-muted-foreground">4 pending fixtures</p>
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
						<div className="text-2xl font-bold">42</div>
						<p className="text-xs text-muted-foreground">3 new this week</p>
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
						<div className="text-2xl font-bold">156</div>
						<p className="text-xs text-muted-foreground">
							32 for upcoming fixtures
						</p>
					</CardContent>
				</Card>
			</div>

			<Tabs defaultValue="fixtures">
				<TabsList>
					<TabsTrigger value="fixtures">Manage Fixtures</TabsTrigger>
					<TabsTrigger value="submissions">View Submissions</TabsTrigger>
					<TabsTrigger value="points">Assign Points</TabsTrigger>
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
			</Tabs>
		</main>
	);
}
