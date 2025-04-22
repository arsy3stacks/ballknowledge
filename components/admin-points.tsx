"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, Award } from "lucide-react";
import { toast } from "sonner";

// Demo data for the points assignment view
const demoFixtures = [
  {
    id: "1",
    fixture: "Arsenal vs Manchester United",
    match_day: "2025-05-10",
    status: "completed",
    result: "H",
  },
  {
    id: "2",
    fixture: "Liverpool vs Manchester City",
    match_day: "2025-05-10",
    status: "completed",
    result: "D",
  },
  {
    id: "3",
    fixture: "Chelsea vs Tottenham",
    match_day: "2025-05-11",
    status: "pending",
    result: null,
  },
];

const demoPredictions = [
  {
    id: "1",
    player: "footie_fanatic",
    fixture_id: "1",
    prediction: "H",
    points_assigned: false,
  },
  {
    id: "2",
    player: "soccer_sage",
    fixture_id: "1",
    prediction: "D",
    points_assigned: false,
  },
  {
    id: "3",
    player: "kick_king",
    fixture_id: "1",
    prediction: "A",
    points_assigned: false,
  },
  {
    id: "4",
    player: "premier_pro",
    fixture_id: "2",
    prediction: "D",
    points_assigned: true,
  },
  {
    id: "5",
    player: "footie_fanatic",
    fixture_id: "2",
    prediction: "A",
    points_assigned: true,
  },
];

export function AdminPoints() {
  const [selectedFixture, setSelectedFixture] = useState<string>(demoFixtures[0].id);
  const [loading, setLoading] = useState(false);
  
  // Filter predictions for the selected fixture
  const filteredPredictions = demoPredictions.filter(
    prediction => prediction.fixture_id === selectedFixture
  );
  
  // Get the selected fixture details
  const currentFixture = demoFixtures.find(fixture => fixture.id === selectedFixture);
  
  const handleAssignPoints = async () => {
    if (!currentFixture || currentFixture.status !== "completed") {
      toast.error("Cannot assign points for a pending fixture");
      return;
    }
    
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Update our demo data - in a real app this would be a Supabase call
      const updatedPredictions = demoPredictions.map(prediction => {
        if (prediction.fixture_id === selectedFixture) {
          return {
            ...prediction,
            points_assigned: true
          };
        }
        return prediction;
      });
      
      // In a real app, this would be updating state from the database
      
      setLoading(false);
      toast.success("Points assigned successfully");
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Manage Points</CardTitle>
          <CardDescription>Assign points for completed fixtures</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Label htmlFor="fixture-selector">Select Fixture</Label>
            <Select 
              value={selectedFixture} 
              onValueChange={setSelectedFixture}
            >
              <SelectTrigger id="fixture-selector">
                <SelectValue placeholder="Select a fixture" />
              </SelectTrigger>
              <SelectContent>
                {demoFixtures.map((fixture) => (
                  <SelectItem key={fixture.id} value={fixture.id}>
                    {fixture.fixture} ({new Date(fixture.match_day).toLocaleDateString()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {currentFixture && (
            <div className="mb-6">
              <div className="flex items-center justify-between bg-muted p-4 rounded-md">
                <div>
                  <h3 className="font-medium">{currentFixture.fixture}</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(currentFixture.match_day).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span>Result:</span>
                  {currentFixture.result ? (
                    <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-white font-medium ${
                      currentFixture.result === "H" ? "bg-chart-1" :
                      currentFixture.result === "D" ? "bg-chart-2" :
                      "bg-chart-3"
                    }`}>
                      {currentFixture.result}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Pending</span>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Player</TableHead>
                  <TableHead>Prediction</TableHead>
                  <TableHead>Correct</TableHead>
                  <TableHead>Points Assigned</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPredictions.length > 0 ? (
                  filteredPredictions.map((prediction) => (
                    <TableRow key={prediction.id}>
                      <TableCell className="font-medium">{prediction.player}</TableCell>
                      <TableCell>
                        <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-white font-medium ${
                          prediction.prediction === "H" ? "bg-chart-1" :
                          prediction.prediction === "D" ? "bg-chart-2" :
                          "bg-chart-3"
                        }`}>
                          {prediction.prediction}
                        </div>
                      </TableCell>
                      <TableCell>
                        {currentFixture?.result ? (
                          prediction.prediction === currentFixture.result ? (
                            <div className="flex items-center text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="h-5 w-5 mr-1" />
                              <span>Correct</span>
                            </div>
                          ) : (
                            <div className="flex items-center text-red-600 dark:text-red-400">
                              <XCircle className="h-5 w-5 mr-1" />
                              <span>Incorrect</span>
                            </div>
                          )
                        ) : (
                          <span className="text-muted-foreground">Pending result</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {prediction.points_assigned ? (
                          <div className="flex items-center text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="h-5 w-5 mr-1" />
                            <span>Assigned</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Not assigned</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                      No predictions for this fixture
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="mt-6">
            <Button 
              className="w-full"
              onClick={handleAssignPoints}
              disabled={
                loading || 
                currentFixture?.status !== "completed" ||
                filteredPredictions.every(p => p.points_assigned)
              }
            >
              <Award className="mr-2 h-4 w-4" />
              {loading ? "Assigning Points..." : "Assign Points Automatically"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}