import { createClient } from '@supabase/supabase-js';

// These are only used on the client, so it's safe to expose them
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database schema
export type Player = {
  id: string;
  auth_id: string;
  username: string;
  club_supported: string;
  nationality: string;
  joined_at: string;
};

export type Fixture = {
  id: string;
  match_day: string;
  home_team: string;
  away_team: string;
  outcome: 'H' | 'D' | 'A' | null;
  created_at: string;
};

export type PredictionOutcome = 'H' | 'D' | 'A';

export type Prediction = {
  id: string;
  player_id: string;
  fixture_id: string;
  predicted_outcome: PredictionOutcome;
  submitted_at: string;
};

export type Points = {
  id: string;
  player_id: string;
  fixture_id: string;
  points_earned: number;
  awarded_at: string;
};