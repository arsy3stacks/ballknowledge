"use client"

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

// Demo data for the submissions view
const demoSubmissions = [
  {
    id: "1",
    player: "footie_fanatic",
    fixture: "Arsenal vs Manchester United",
    match_day: "2025-05-10",
    prediction: "H",
  },
  {
    id: "2",
    player: "soccer_sage",
    fixture: "Arsenal vs Manchester United",
    match_day: "2025-05-10",
    prediction: "D",
  },
  {
    id: "3",
    player: "kick_king",
    fixture: "Arsenal vs Manchester United",
    match_day: "2025-05-10",
    prediction: "A",
  },
  {
    id: "4",
    player: "premier_pro",
    fixture: "Liverpool vs Manchester City",
    match_day: "2025-05-10",
    prediction: "D",
  },
  {
    id: "5",
    player: "footie_fanatic",
    fixture: "Liverpool vs Manchester City",
    match_day: "2025-05-10",
    prediction: "A",
  },
  {
    id: "6",
    player: "soccer_sage",
    fixture: "Chelsea vs Tottenham",
    match_day: "2025-05-11",
    prediction: "H",
  },
];

export function AdminSubmissions() {
  const [selectedFixture, setSelectedFixture] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter submissions based on fixture and search query
  const filteredSubmissions = demoSubmissions.filter((submission) => {
    const matchesFixture = !selectedFixture || submission.fixture === selectedFixture;
    const matchesSearch = !searchQuery || 
      submission.player.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFixture && matchesSearch;
  });
  
  // Get unique fixtures for the filter dropdown
  const uniqueFixtures = Array.from(new Set(demoSubmissions.map(s => s.fixture)));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Player Predictions</CardTitle>
          <CardDescription>View and filter all submitted predictions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="w-full md:w-1/3">
              <Label htmlFor="fixture-filter">Filter by Fixture</Label>
              <Select 
                value={selectedFixture} 
                onValueChange={setSelectedFixture}
              >
                <SelectTrigger id="fixture-filter">
                  <SelectValue placeholder="All fixtures" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={undefined}>All fixtures</SelectItem>
                  {uniqueFixtures.map((fixture) => (
                    <SelectItem key={fixture} value={fixture}>{fixture}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-2/3">
              <Label htmlFor="search-players">Search Players</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search-players"
                  placeholder="Search by username"
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Player</TableHead>
                  <TableHead>Fixture</TableHead>
                  <TableHead>Match Day</TableHead>
                  <TableHead>Prediction</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.length > 0 ? (
                  filteredSubmissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-medium">{submission.player}</TableCell>
                      <TableCell>{submission.fixture}</TableCell>
                      <TableCell>{new Date(submission.match_day).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-white font-medium ${
                          submission.prediction === "H" ? "bg-chart-1" :
                          submission.prediction === "D" ? "bg-chart-2" :
                          "bg-chart-3"
                        }`}>
                          {submission.prediction}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                      No predictions match your filters
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredSubmissions.length} of {demoSubmissions.length} predictions
          </div>
        </CardContent>
      </Card>
    </div>
  );
}