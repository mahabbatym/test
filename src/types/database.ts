export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type GameStatus = "waiting" | "active" | "finished";
export type GameResult = "white" | "black" | "draw";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          bio: string | null;
          country: string | null;
          city: string | null;
          avatar_url: string | null;
          elo_rating: number;
          coins: number;
          hearts: number;
          is_premium: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          bio?: string | null;
          country?: string | null;
          city?: string | null;
          avatar_url?: string | null;
          elo_rating?: number;
          coins?: number;
          hearts?: number;
          is_premium?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          bio?: string | null;
          country?: string | null;
          city?: string | null;
          avatar_url?: string | null;
          elo_rating?: number;
          coins?: number;
          hearts?: number;
          is_premium?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      feedback: {
        Row: {
          id: string;
          user_id: string | null;
          type: "bug" | "suggestion";
          message: string;
          path: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          type: "bug" | "suggestion";
          message: string;
          path?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          type?: "bug" | "suggestion";
          message?: string;
          path?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      games: {
        Row: {
          id: string;
          white_player_id: string;
          black_player_id: string | null;
          status: GameStatus;
          result: GameResult | null;
          winner_id: string | null;
          current_fen: string;
          pgn: string;
          move_count: number;
          white_time_ms: number;
          black_time_ms: number;
          rematch_requested_by: string | null;
          rematch_game_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          white_player_id: string;
          black_player_id?: string | null;
          status?: GameStatus;
          result?: GameResult | null;
          winner_id?: string | null;
          current_fen: string;
          pgn?: string;
          move_count?: number;
          white_time_ms?: number;
          black_time_ms?: number;
          rematch_requested_by?: string | null;
          rematch_game_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          white_player_id?: string;
          black_player_id?: string | null;
          status?: GameStatus;
          result?: GameResult | null;
          winner_id?: string | null;
          current_fen?: string;
          pgn?: string;
          move_count?: number;
          white_time_ms?: number;
          black_time_ms?: number;
          rematch_requested_by?: string | null;
          rematch_game_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      moves: {
        Row: {
          id: string;
          game_id: string;
          move_number: number;
          notation: string;
          fen: string;
          player_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          game_id: string;
          move_number: number;
          notation: string;
          fen: string;
          player_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          game_id?: string;
          move_number?: number;
          notation?: string;
          fen?: string;
          player_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Game = Database["public"]["Tables"]["games"]["Row"];
export type Move = Database["public"]["Tables"]["moves"]["Row"];
export type Feedback = Database["public"]["Tables"]["feedback"]["Row"];
