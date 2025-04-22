"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Fixture, PredictionOutcome } from "@/lib/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { format } from "date-fns";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface FixtureCardProps {
  fixture: Fixture;
  playerId: string;
}

export function FixtureCard({ fixture, playerId }: FixtureCardProps) {
  const supabase = createClientComponentClient();
  const [selectedOutcome, setSelectedOutcome] = useState<PredictionOutcome | null>(null);
  const [existingPrediction, setExistingPrediction] = useState<PredictionOutcome | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if user has already predicted this fixture
  useState(() => {
    const checkExistingPrediction = async () => {
      if (!playerId) return;
      
      const { data } = await supabase
        .from('predictions')
        .select('predicted_outcome')
        .eq('player_id', playerId)
        .eq('fixture_id', fixture.id)
        .single();
      
      if (data) {
        setExistingPrediction(data.predicted_outcome as PredictionOutcome);
        setSelectedOutcome(data.predicted_outcome as PredictionOutcome);
      }
    };
    
    checkExistingPrediction();
  });

  const handlePrediction = async () => {
    if (!selectedOutcome || !playerId) return;
    
    setIsSubmitting(true);
    
    try {
      if (existingPrediction) {
        // Update existing prediction
        await supabase
          .from('predictions')
          .update({ 
            predicted_outcome: selectedOutcome,
            submitted_at: new Date().toISOString()
          })
          .eq('player_id', playerId)
          .eq('fixture_id', fixture.id);
          
        toast.success("Prediction updated successfully!");
      } else {
        // Create new prediction
        await supabase
          .from('predictions')
          .insert([{ 
            player_id: playerId,
            fixture_id: fixture.id,
            predicted_outcome: selectedOutcome,
            submitted_at: new Date().toISOString()
          }]);
          
        setExistingPrediction(selectedOutcome);
        toast.success("Prediction submitted successfully!");
      }
    } catch (error) {
      toast.error("Failed to submit prediction. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format the match date
  const matchDate = new Date(fixture.match_day);
  const formattedDate = format(matchDate, "EEE, MMM d");
  
  // Check if prediction deadline has passed
  const deadlinePassed = new Date() > matchDate;

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex flex-col space-y-3">
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">{formattedDate}</div>
          {deadlinePassed && (
            <div className="flex items-center text-sm text-amber-500 dark:text-amber-400">
              <AlertCircle className="h-4 w-4 mr-1" />
              Deadline passed
            </div>
          )}
          {existingPrediction && !deadlinePassed && (
            <div className="flex items-center text-sm text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Predicted
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-3 items-center gap-2 py-2">
          <div className="text-center font-medium">{fixture.home_team}</div>
          <div className="text-center text-muted-foreground text-sm">vs</div>
          <div className="text-center font-medium">{fixture.away_team}</div>
        </div>
        
        {!deadlinePassed && (
          <>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={selectedOutcome === "H" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedOutcome("H")}
                className={selectedOutcome === "H" ? "bg-chart-1" : ""}
              >
                Home Win
              </Button>
              <Button
                variant={selectedOutcome === "D" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedOutcome("D")}
                className={selectedOutcome === "D" ? "bg-chart-2" : ""}
              >
                Draw
              </Button>
              <Button
                variant={selectedOutcome === "A" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedOutcome("A")}
                className={selectedOutcome === "A" ? "bg-chart-3" : ""}
              >
                Away Win
              </Button>
            </div>
            
            <Button 
              onClick={handlePrediction}
              disabled={!selectedOutcome || isSubmitting || (existingPrediction === selectedOutcome)}
              size="sm"
            >
              {isSubmitting ? "Submitting..." : existingPrediction ? "Update Prediction" : "Submit Prediction"}
            </Button>
          </>
        )}
        
        {deadlinePassed && fixture.outcome && (
          <div className="bg-secondary p-2 rounded text-center">
            Result: {
              fixture.outcome === "H" ? "Home Win" :
              fixture.outcome === "A" ? "Away Win" : "Draw"
            }
          </div>
        )}
      </div>
    </Card>
  );
}