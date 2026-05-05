export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      decks: {
        Row: {
          id: string
          name: string
          description: string | null
          icon: string | null
          color: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          icon?: string | null
          color?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          icon?: string | null
          color?: string
          created_at?: string
          updated_at?: string
        }
      }
      questions: {
        Row: {
          id: string
          deck_id: string
          question: string
          answer: string
          reference: string | null
          difficulty: number
          created_at: string
        }
        Insert: {
          id?: string
          deck_id: string
          question: string
          answer: string
          reference?: string | null
          difficulty?: number
          created_at?: string
        }
        Update: {
          id?: string
          deck_id?: string
          question?: string
          answer?: string
          reference?: string | null
          difficulty?: number
          created_at?: string
        }
      }
      deck_questions: {
        Row: {
          id: string
          deck_id: string
          question_id: string
        }
        Insert: {
          id?: string
          deck_id: string
          question_id: string
        }
        Update: {
          id?: string
          deck_id?: string
          question_id?: string
        }
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          question_id: string
          deck_id: string
          status: string
          attempts: number
          last_reviewed: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          question_id: string
          deck_id: string
          status?: string
          attempts?: number
          last_reviewed?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          question_id?: string
          deck_id?: string
          status?: string
          attempts?: number
          last_reviewed?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      daily_challenges: {
        Row: {
          id: string
          date: string
          question_ids: string[]
          completed_by: string[]
          created_at: string
        }
        Insert: {
          id?: string
          date?: string
          question_ids: string[]
          completed_by?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          date?: string
          question_ids?: string[]
          completed_by?: string[]
          created_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
