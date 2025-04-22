"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { CalendarDays, Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

// Mock teams for the demo
const teams = [
  "Arsenal", "Aston Villa", "Bournemouth", "Brentford", "Brighton", "Chelsea",
  "Crystal Palace", "Everton", "Fulham", "Leeds United", "Leicester City", "Liverpool",
  "Manchester City", "Manchester United", "Newcastle United", "Nottingham Forest", 
  "Southampton", "Tottenham", "West Ham", "Wolves"
];

export function AdminFixtures() {
  const supabase = createClientComponentClient();
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newFixture, setNewFixture] = useState({
    match_day: format(new Date(), "yyyy-MM-dd"),
    home_team: "",
    away_team: "",
  });

  // In a real app, you'd fetch existing fixtures here
  
  const handleAddFixture = async () => {
    if (!newFixture.home_team || !newFixture.away_team || !newFixture.match_day) {
      toast.error("Please fill in all fixture details");
      return;
    }
    
    if (newFixture.home_team === newFixture.away_team) {
      toast.error("Home and away teams cannot be the same");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('fixtures')
        .insert([{
          match_day: newFixture.match_day,
          home_team: newFixture.home_team,
          away_team: newFixture.away_team,
          outcome: null,
          created_at: new Date().toISOString()
        }])
        .select();
      
      if (error) throw error;
      
      // Add the new fixture to the list
      setFixtures([...fixtures, data[0]]);
      
      // Reset form
      setNewFixture({
        match_day: format(new Date(), "yyyy-MM-dd"),
        home_team: "",
        away_team: "",
      });
      
      toast.success("Fixture added successfully");
    } catch (error: any) {
      toast.error("Failed to add fixture: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  // For demo purposes, we'll use static fixtures
  const demoFixtures = [
    {
      id: "1",
      match_day: "2025-05-10",
      home_team: "Arsenal",
      away_team: "Manchester United",
      outcome: null,
    },
    {
      id: "2",
      match_day: "2025-05-10",
      home_team: "Liverpool",
      away_team: "Manchester City",
      outcome: null,
    },
    {
      id: "3",
      match_day: "2025-05-11",
      home_team: "Chelsea",
      away_team: "Tottenham",
      outcome: null,
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Fixture</CardTitle>
          <CardDescription>Create a new match for players to predict</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="match-date">Match Date</Label>
              <Input
                id="match-date"
                type="date"
                value={newFixture.match_day}
                onChange={(e) => setNewFixture({ ...newFixture, match_day: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="home-team">Home Team</Label>
              <Select
                value={newFixture.home_team}
                onValueChange={(value) => setNewFixture({ ...newFixture, home_team: value })}
              >
                <SelectTrigger id="home-team">
                  <SelectValue placeholder="Select home team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team} value={team}>{team}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="away-team">Away Team</Label>
              <Select
                value={newFixture.away_team}
                onValueChange={(value) => setNewFixture({ ...newFixture, away_team: value })}
              >
                <SelectTrigger id="away-team">
                  <SelectValue placeholder="Select away team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team} value={team}>{team}</SelectItem>
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
            {demoFixtures.map((fixture) => (
              <div key={fixture.id} className="flex items-center justify-between border-b pb-3 last:border-b-0">
                <div className="flex items-center gap-4">
                  <div className="bg-muted p-2 rounded">
                    <CalendarDays className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{fixture.home_team} vs {fixture.away_team}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(fixture.match_day).toLocaleDateString("en-US", { 
                        weekday: 'short', 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select>
                    <SelectTrigger className="w-28">
                      <SelectValue placeholder="Result" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="H">Home Win</SelectItem>
                      <SelectItem value="D">Draw</SelectItem>
                      <SelectItem value="A">Away Win</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon">
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="icon">
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