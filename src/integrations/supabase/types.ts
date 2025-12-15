export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      ai_feedback: {
        Row: {
          created_at: string
          feedback: string
          id: string
          recommendations: Json | null
          user_id: string
          week_of: string
        }
        Insert: {
          created_at?: string
          feedback: string
          id?: string
          recommendations?: Json | null
          user_id: string
          week_of: string
        }
        Update: {
          created_at?: string
          feedback?: string
          id?: string
          recommendations?: Json | null
          user_id?: string
          week_of?: string
        }
        Relationships: []
      }
      ai_personalizations: {
        Row: {
          analysis_type: string
          created_at: string
          id: string
          insights: Json
          last_analysis_at: string
          plans_generated: boolean
          recommendations: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis_type?: string
          created_at?: string
          id?: string
          insights?: Json
          last_analysis_at?: string
          plans_generated?: boolean
          recommendations?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis_type?: string
          created_at?: string
          id?: string
          insights?: Json
          last_analysis_at?: string
          plans_generated?: boolean
          recommendations?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          category: string | null
          coach_id: string
          content: string | null
          cover_url: string | null
          created_at: string
          id: string
          introduction: string | null
          is_published: boolean
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          coach_id: string
          content?: string | null
          cover_url?: string | null
          created_at?: string
          id?: string
          introduction?: string | null
          is_published?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          coach_id?: string
          content?: string | null
          cover_url?: string | null
          created_at?: string
          id?: string
          introduction?: string | null
          is_published?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      coach_checkins: {
        Row: {
          coach_id: string
          created_at: string
          customer_id: string
          due_date: string | null
          id: string
          message: string | null
          status: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          customer_id: string
          due_date?: string | null
          id?: string
          message?: string | null
          status?: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          customer_id?: string
          due_date?: string | null
          id?: string
          message?: string | null
          status?: string
        }
        Relationships: []
      }
      coach_offers: {
        Row: {
          coach_id: string
          created_at: string
          customer_id: string
          duration_months: number
          expires_at: string
          id: string
          message_id: string
          price: number
          status: Database["public"]["Enums"]["offer_status"]
          updated_at: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          customer_id: string
          duration_months: number
          expires_at?: string
          id?: string
          message_id: string
          price: number
          status?: Database["public"]["Enums"]["offer_status"]
          updated_at?: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          customer_id?: string
          duration_months?: number
          expires_at?: string
          id?: string
          message_id?: string
          price?: number
          status?: Database["public"]["Enums"]["offer_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_offers_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_offers_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "customer_states"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "coach_offers_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_offers_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_offers_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_states"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "coach_offers_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_offers_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_payout_settings: {
        Row: {
          bank_details: Json | null
          coach_id: string
          created_at: string
          id: string
          payout_method: string
          paypal_account_id: string | null
          paypal_email: string | null
          stripe_account_id: string | null
          updated_at: string
        }
        Insert: {
          bank_details?: Json | null
          coach_id: string
          created_at?: string
          id?: string
          payout_method?: string
          paypal_account_id?: string | null
          paypal_email?: string | null
          stripe_account_id?: string | null
          updated_at?: string
        }
        Update: {
          bank_details?: Json | null
          coach_id?: string
          created_at?: string
          id?: string
          payout_method?: string
          paypal_account_id?: string | null
          paypal_email?: string | null
          stripe_account_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      coach_requests: {
        Row: {
          coach_id: string
          created_at: string
          customer_id: string
          id: string
          message: string | null
          status: Database["public"]["Enums"]["request_status"]
          updated_at: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          customer_id: string
          id?: string
          message?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          updated_at?: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          customer_id?: string
          id?: string
          message?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_requests_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_requests_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "customer_states"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "coach_requests_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_requests_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_requests_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_states"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "coach_requests_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          coach_id: string
          created_at: string
          customer_id: string
          end_date: string
          id: string
          offer_id: string | null
          payout_id: string | null
          platform_fee_rate: number
          price_cents: number
          start_date: string
          status: Database["public"]["Enums"]["contract_status"]
          updated_at: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          customer_id: string
          end_date: string
          id?: string
          offer_id?: string | null
          payout_id?: string | null
          platform_fee_rate?: number
          price_cents: number
          start_date: string
          status?: Database["public"]["Enums"]["contract_status"]
          updated_at?: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          customer_id?: string
          end_date?: string
          id?: string
          offer_id?: string | null
          payout_id?: string | null
          platform_fee_rate?: number
          price_cents?: number
          start_date?: string
          status?: Database["public"]["Enums"]["contract_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contracts_payout_id_fkey"
            columns: ["payout_id"]
            isOneToOne: false
            referencedRelation: "payouts"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          coach_id: string
          created_at: string
          customer_id: string
          id: string
          status: Database["public"]["Enums"]["conversation_status"]
          updated_at: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          customer_id: string
          id?: string
          status?: Database["public"]["Enums"]["conversation_status"]
          updated_at?: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          customer_id?: string
          id?: string
          status?: Database["public"]["Enums"]["conversation_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "customer_states"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "conversations_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_states"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "conversations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string
          email: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      daily_checkins: {
        Row: {
          created_at: string
          date: string
          energy: number | null
          id: string
          mood: number | null
          sleep_hours: number | null
          user_id: string
          water_liters: number | null
        }
        Insert: {
          created_at?: string
          date?: string
          energy?: number | null
          id?: string
          mood?: number | null
          sleep_hours?: number | null
          user_id: string
          water_liters?: number | null
        }
        Update: {
          created_at?: string
          date?: string
          energy?: number | null
          id?: string
          mood?: number | null
          sleep_hours?: number | null
          user_id?: string
          water_liters?: number | null
        }
        Relationships: []
      }
      library_items: {
        Row: {
          category: Database["public"]["Enums"]["library_category"]
          coach_id: string
          created_at: string
          details: Json | null
          hero_image_url: string | null
          id: string
          introduction: string | null
          name: string
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["library_category"]
          coach_id: string
          created_at?: string
          details?: Json | null
          hero_image_url?: string | null
          id?: string
          introduction?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["library_category"]
          coach_id?: string
          created_at?: string
          details?: Json | null
          hero_image_url?: string | null
          id?: string
          introduction?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "library_items_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_items_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "customer_states"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "library_items_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          message_type: Database["public"]["Enums"]["message_type"]
          metadata: Json | null
          sender_id: string
          updated_at: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          message_type?: Database["public"]["Enums"]["message_type"]
          metadata?: Json | null
          sender_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          message_type?: Database["public"]["Enums"]["message_type"]
          metadata?: Json | null
          sender_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "customer_states"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      motivation_messages: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          message: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          message: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          message?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          data: Json | null
          id: string
          read_at: string | null
          title: string | null
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          read_at?: string | null
          title?: string | null
          type: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          read_at?: string | null
          title?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      onboarding_details: {
        Row: {
          allergies: string[]
          country: string | null
          created_at: string
          dob: string | null
          gender: string | null
          goals: string[]
          height: number | null
          id: string
          injuries: string[]
          location: string | null
          meditation_experience: string | null
          training_dislikes: string[]
          training_likes: string[]
          updated_at: string
          user_id: string
          weight: number | null
        }
        Insert: {
          allergies?: string[]
          country?: string | null
          created_at?: string
          dob?: string | null
          gender?: string | null
          goals?: string[]
          height?: number | null
          id?: string
          injuries?: string[]
          location?: string | null
          meditation_experience?: string | null
          training_dislikes?: string[]
          training_likes?: string[]
          updated_at?: string
          user_id: string
          weight?: number | null
        }
        Update: {
          allergies?: string[]
          country?: string | null
          created_at?: string
          dob?: string | null
          gender?: string | null
          goals?: string[]
          height?: number | null
          id?: string
          injuries?: string[]
          location?: string | null
          meditation_experience?: string | null
          training_dislikes?: string[]
          training_likes?: string[]
          updated_at?: string
          user_id?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_details_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_details_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "customer_states"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "onboarding_details_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payouts: {
        Row: {
          amount_cents: number
          coach_id: string
          created_at: string
          id: string
          net_amount_cents: number
          period_end: string
          period_start: string
          platform_fee_cents: number
          status: string
        }
        Insert: {
          amount_cents: number
          coach_id: string
          created_at?: string
          id?: string
          net_amount_cents: number
          period_end: string
          period_start: string
          platform_fee_cents: number
          status: string
        }
        Update: {
          amount_cents?: number
          coach_id?: string
          created_at?: string
          id?: string
          net_amount_cents?: number
          period_end?: string
          period_start?: string
          platform_fee_cents?: number
          status?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          certifications: Json | null
          coach_id: string | null
          created_at: string
          email: string | null
          full_name: string | null
          has_used_trial: boolean
          id: string
          onboarding_complete: boolean
          phone: string | null
          plan: string | null
          plan_expiry: string | null
          price_max_cents: number | null
          price_min_cents: number | null
          role: string
          skills: string[] | null
          socials: Json | null
          stripe_customer_id: string | null
          tagline: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          certifications?: Json | null
          coach_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          has_used_trial?: boolean
          id: string
          onboarding_complete?: boolean
          phone?: string | null
          plan?: string | null
          plan_expiry?: string | null
          price_max_cents?: number | null
          price_min_cents?: number | null
          role?: string
          skills?: string[] | null
          socials?: Json | null
          stripe_customer_id?: string | null
          tagline?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          certifications?: Json | null
          coach_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          has_used_trial?: boolean
          id?: string
          onboarding_complete?: boolean
          phone?: string | null
          plan?: string | null
          plan_expiry?: string | null
          price_max_cents?: number | null
          price_min_cents?: number | null
          role?: string
          skills?: string[] | null
          socials?: Json | null
          stripe_customer_id?: string | null
          tagline?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      program_entries: {
        Row: {
          created_at: string
          data: Json | null
          date: string
          id: string
          notes: string | null
          program_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          date?: string
          id?: string
          notes?: string | null
          program_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          date?: string
          id?: string
          notes?: string | null
          program_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_entries_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      programs: {
        Row: {
          assigned_to: string | null
          category: Database["public"]["Enums"]["program_category"]
          coach_id: string
          created_at: string
          description: string
          id: string
          is_ai_generated: boolean
          name: string
          plan: Json | null
          scheduled_date: string | null
          status: Database["public"]["Enums"]["program_status"]
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          category: Database["public"]["Enums"]["program_category"]
          coach_id: string
          created_at?: string
          description: string
          id?: string
          is_ai_generated?: boolean
          name: string
          plan?: Json | null
          scheduled_date?: string | null
          status?: Database["public"]["Enums"]["program_status"]
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          category?: Database["public"]["Enums"]["program_category"]
          coach_id?: string
          created_at?: string
          description?: string
          id?: string
          is_ai_generated?: boolean
          name?: string
          plan?: Json | null
          scheduled_date?: string | null
          status?: Database["public"]["Enums"]["program_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "programs_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "programs_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "customer_states"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "programs_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "programs_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "programs_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "customer_states"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "programs_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      progress_photos: {
        Row: {
          created_at: string
          date: string
          id: string
          image_url: string
          notes: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          image_url: string
          notes?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          image_url?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: []
      }
      shared_files: {
        Row: {
          coach_id: string
          created_at: string | null
          customer_id: string
          file_description: string | null
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          updated_at: string | null
        }
        Insert: {
          coach_id: string
          created_at?: string | null
          customer_id: string
          file_description?: string | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          coach_id?: string
          created_at?: string | null
          customer_id?: string
          file_description?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shared_files_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shared_files_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "customer_states"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "shared_files_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shared_files_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shared_files_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_states"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "shared_files_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      weight_entries: {
        Row: {
          created_at: string
          date: string
          id: string
          notes: string | null
          user_id: string
          weight_kg: number
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          user_id: string
          weight_kg: number
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          user_id?: string
          weight_kg?: number
        }
        Relationships: []
      }
      withdrawal_requests: {
        Row: {
          amount_cents: number
          coach_id: string
          created_at: string
          id: string
          processed_at: string | null
          status: string
        }
        Insert: {
          amount_cents: number
          coach_id: string
          created_at?: string
          id?: string
          processed_at?: string | null
          status?: string
        }
        Update: {
          amount_cents?: number
          coach_id?: string
          created_at?: string
          id?: string
          processed_at?: string | null
          status?: string
        }
        Relationships: []
      }
    }
    Views: {
      coaches: {
        Row: {
          avatar_url: string | null
          bio: string | null
          certifications: Json | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string | null
          price_max_cents: number | null
          price_min_cents: number | null
          skills: string[] | null
          socials: Json | null
          tagline: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          certifications?: Json | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string | null
          price_max_cents?: number | null
          price_min_cents?: number | null
          skills?: string[] | null
          socials?: Json | null
          tagline?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          certifications?: Json | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string | null
          price_max_cents?: number | null
          price_min_cents?: number | null
          skills?: string[] | null
          socials?: Json | null
          tagline?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      customer_states: {
        Row: {
          contract_expired: boolean | null
          contract_expiring_soon: boolean | null
          customer_id: string | null
          missing_program: boolean | null
          needs_feedback: boolean | null
          off_track: boolean | null
          on_track: boolean | null
          program_expired: boolean | null
          soon_to_expire: boolean | null
        }
        Relationships: []
      }
      renewal_prompts: {
        Row: {
          coach_id: string | null
          contract_id: string | null
          customer_id: string | null
          end_date: string | null
          prompt_from: string | null
        }
        Insert: {
          coach_id?: string | null
          contract_id?: string | null
          customer_id?: string | null
          end_date?: string | null
          prompt_from?: never
        }
        Update: {
          coach_id?: string | null
          contract_id?: string | null
          customer_id?: string | null
          end_date?: string | null
          prompt_from?: never
        }
        Relationships: []
      }
    }
    Functions: {
      accept_offer_create_contract: {
        Args: { p_offer_id: string }
        Returns: string
      }
      assign_coach_role: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      become_coach: { Args: never; Returns: undefined }
      can_access_customer_pii: {
        Args: { customer_user_id: string }
        Returns: boolean
      }
      can_view_coach_public_profile: {
        Args: { coach_id: string; viewer_id: string }
        Returns: boolean
      }
      current_user_is_coach: { Args: never; Returns: boolean }
      get_customer_safe_fields: {
        Args: { customer_user_id: string }
        Returns: {
          avatar_url: string
          created_at: string
          full_name: string
          id: string
          onboarding_complete: boolean
          plan: string
          plan_expiry: string
          role: string
        }[]
      }
      get_primary_user_role: { Args: { _user_id: string }; Returns: string }
      get_public_coach_profiles: {
        Args: never
        Returns: {
          avatar_url: string
          bio: string
          certifications: Json
          created_at: string
          full_name: string
          id: string
          role: string
          skills: string[]
          socials: Json
          tagline: string
          updated_at: string
        }[]
      }
      get_public_profiles: {
        Args: { ids: string[] }
        Returns: {
          avatar_url: string
          email: string
          full_name: string
          id: string
        }[]
      }
      get_user_role: { Args: { user_id: string }; Returns: string }
      has_active_contract: {
        Args: { coach_user_id: string; customer_user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_coach_customer_relationship: {
        Args: { coach_user_id: string; customer_user_id: string }
        Returns: boolean
      }
      notify_contract_renewals: { Args: never; Returns: undefined }
      promote_to_coach: { Args: { target_user_id: string }; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "coach" | "customer"
      contract_status:
        | "pending"
        | "active"
        | "completed"
        | "expired"
        | "cancelled"
      conversation_status: "active" | "archived"
      library_category: "exercise" | "recipe" | "mental health"
      message_type: "text" | "offer" | "system"
      offer_status: "pending" | "accepted" | "rejected" | "expired"
      payout_status: "pending" | "paid" | "failed"
      program_category: "fitness" | "nutrition" | "mental health"
      program_status: "active" | "scheduled" | "draft" | "normal"
      request_status: "pending" | "accepted" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "coach", "customer"],
      contract_status: [
        "pending",
        "active",
        "completed",
        "expired",
        "cancelled",
      ],
      conversation_status: ["active", "archived"],
      library_category: ["exercise", "recipe", "mental health"],
      message_type: ["text", "offer", "system"],
      offer_status: ["pending", "accepted", "rejected", "expired"],
      payout_status: ["pending", "paid", "failed"],
      program_category: ["fitness", "nutrition", "mental health"],
      program_status: ["active", "scheduled", "draft", "normal"],
      request_status: ["pending", "accepted", "rejected"],
    },
  },
} as const
