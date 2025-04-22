"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardNav } from "@/components/dashboard-nav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminFixtures } from "@/components/admin-fixtures";
import { AdminSubmissions } from "@/components/admin-submissions";
import { AdminPoints } from "@/components/admin-points";
import { CalendarDays, Users, Award, ClipboardCheck } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<any>(null);
  const [player, setPlayer] = useState<any>(null);

  // In production, you'd need to add proper authorization checks here
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} player={player} onSignOut={handleSignOut} />
      
      <div className="container grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 py-8">
        <DashboardNav />
        
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
                <p className="text-xs text-muted-foreground">
                  4 pending fixtures
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
                <div className="text-2xl font-bold">42</div>
                <p className="text-xs text-muted-foreground">
                  3 new this week
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
      </div>
    </div>
  );
}