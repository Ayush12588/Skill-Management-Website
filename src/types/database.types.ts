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
          username: string
          created_at: string
        }
        Insert: {
          id: string
          username: string
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          created_at?: string
        }
      }
      journeys: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          duration_days: number
          start_date: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string
          duration_days?: number
          start_date?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          duration_days?: number
          start_date?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      daily_tasks: {
        Row: {
          id: string
          journey_id: string
          task_text: string
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          journey_id: string
          task_text: string
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          journey_id?: string
          task_text?: string
          order_index?: number
          created_at?: string
        }
      }
      task_completions: {
        Row: {
          id: string
          daily_task_id: string
          journey_id: string
          user_id: string
          completion_date: string
          status: 'completed' | 'failed'
          created_at: string
        }
        Insert: {
          id?: string
          daily_task_id: string
          journey_id: string
          user_id: string
          completion_date: string
          status: 'completed' | 'failed'
          created_at?: string
        }
        Update: {
          id?: string
          daily_task_id?: string
          journey_id?: string
          user_id?: string
          completion_date?: string
          status?: 'completed' | 'failed'
          created_at?: string
        }
      }
    }
  }
}
