// src/lib/types/database.types.ts
export interface User {
    id: string;
    username: string;
    password?: string;
    created_at: string;
    has_set_password: boolean;
  }
  
  export interface UserStats {
    id: string;
    user_id: string;
    games_played: number;
    games_won: number;
    current_streak: number;
    best_streak: number;
    updated_at: string;
  }