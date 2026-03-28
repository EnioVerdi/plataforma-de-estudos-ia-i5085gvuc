// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.4'
  }
  public: {
    Tables: {
      consultation_sessions: {
        Row: {
          created_at: string | null
          id: string
          query: string
          response: string
          subject_id: string | null
          timestamp: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          query: string
          response: string
          subject_id?: string | null
          timestamp?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          query?: string
          response?: string
          subject_id?: string | null
          timestamp?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'consultation_sessions_subject_id_fkey'
            columns: ['subject_id']
            isOneToOne: false
            referencedRelation: 'subjects'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'consultation_sessions_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      flashcard_chat_sessions: {
        Row: {
          created_at: string | null
          flashcard_id: string | null
          id: string
          query: string
          response: string
          timestamp: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          flashcard_id?: string | null
          id?: string
          query: string
          response: string
          timestamp?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          flashcard_id?: string | null
          id?: string
          query?: string
          response?: string
          timestamp?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'flashcard_chat_sessions_flashcard_id_fkey'
            columns: ['flashcard_id']
            isOneToOne: false
            referencedRelation: 'flashcards'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'flashcard_chat_sessions_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      flashcards: {
        Row: {
          answer: string
          created_at: string | null
          difficulty: number | null
          ease_factor: number | null
          id: string
          interval: number | null
          is_generated_by_ai: boolean | null
          last_reviewed_at: string | null
          next_review_at: string | null
          question: string
          repetitions: number | null
          subject_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          answer: string
          created_at?: string | null
          difficulty?: number | null
          ease_factor?: number | null
          id?: string
          interval?: number | null
          is_generated_by_ai?: boolean | null
          last_reviewed_at?: string | null
          next_review_at?: string | null
          question: string
          repetitions?: number | null
          subject_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          answer?: string
          created_at?: string | null
          difficulty?: number | null
          ease_factor?: number | null
          id?: string
          interval?: number | null
          is_generated_by_ai?: boolean | null
          last_reviewed_at?: string | null
          next_review_at?: string | null
          question?: string
          repetitions?: number | null
          subject_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'flashcards_subject_id_fkey'
            columns: ['subject_id']
            isOneToOne: false
            referencedRelation: 'subjects'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'flashcards_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          difficulty_subjects: string[] | null
          email: string
          id: string
          image: string | null
          learning_style: string[] | null
          name: string | null
          onboarding_completed: boolean | null
          preferred_subjects: string[] | null
          study_goals: string[] | null
          study_hours_per_day: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          difficulty_subjects?: string[] | null
          email: string
          id: string
          image?: string | null
          learning_style?: string[] | null
          name?: string | null
          onboarding_completed?: boolean | null
          preferred_subjects?: string[] | null
          study_goals?: string[] | null
          study_hours_per_day?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          difficulty_subjects?: string[] | null
          email?: string
          id?: string
          image?: string | null
          learning_style?: string[] | null
          name?: string | null
          onboarding_completed?: boolean | null
          preferred_subjects?: string[] | null
          study_goals?: string[] | null
          study_hours_per_day?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      progress_metrics: {
        Row: {
          correct_answers: number | null
          created_at: string | null
          date: string | null
          flashcards_reviewed: number | null
          id: string
          incorrect_answers: number | null
          retention_rate: number | null
          study_time: number | null
          user_id: string
        }
        Insert: {
          correct_answers?: number | null
          created_at?: string | null
          date?: string | null
          flashcards_reviewed?: number | null
          id?: string
          incorrect_answers?: number | null
          retention_rate?: number | null
          study_time?: number | null
          user_id: string
        }
        Update: {
          correct_answers?: number | null
          created_at?: string | null
          date?: string | null
          flashcards_reviewed?: number | null
          id?: string
          incorrect_answers?: number | null
          retention_rate?: number | null
          study_time?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'progress_metrics_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      reminder_settings: {
        Row: {
          created_at: string | null
          email_enabled: boolean | null
          exclude_subjects: string[] | null
          frequency: string | null
          id: string
          include_subjects: string[] | null
          last_sent_at: string | null
          preferred_time: string | null
          updated_at: string | null
          user_id: string
          vacation_mode: boolean | null
        }
        Insert: {
          created_at?: string | null
          email_enabled?: boolean | null
          exclude_subjects?: string[] | null
          frequency?: string | null
          id?: string
          include_subjects?: string[] | null
          last_sent_at?: string | null
          preferred_time?: string | null
          updated_at?: string | null
          user_id: string
          vacation_mode?: boolean | null
        }
        Update: {
          created_at?: string | null
          email_enabled?: boolean | null
          exclude_subjects?: string[] | null
          frequency?: string | null
          id?: string
          include_subjects?: string[] | null
          last_sent_at?: string | null
          preferred_time?: string | null
          updated_at?: string | null
          user_id?: string
          vacation_mode?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: 'reminder_settings_user_id_fkey'
            columns: ['user_id']
            isOneToOne: true
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      reviews: {
        Row: {
          created_at: string | null
          flashcard_id: string
          id: string
          rating: number
          reviewed_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          flashcard_id: string
          id?: string
          rating: number
          reviewed_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          flashcard_id?: string
          id?: string
          rating?: number
          reviewed_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'reviews_flashcard_id_fkey'
            columns: ['flashcard_id']
            isOneToOne: false
            referencedRelation: 'flashcards'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'reviews_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      subjects: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'subjects_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// ====== DATABASE EXTENDED CONTEXT (auto-generated) ======
// This section contains actual PostgreSQL column types, constraints, RLS policies,
// functions, triggers, indexes and materialized views not present in the type definitions above.
// IMPORTANT: The TypeScript types above map UUID, TEXT, VARCHAR all to "string".
// Use the COLUMN TYPES section below to know the real PostgreSQL type for each column.
// Always use the correct PostgreSQL type when writing SQL migrations.

// --- COLUMN TYPES (actual PostgreSQL types) ---
// Use this to know the real database type when writing migrations.
// "string" in TypeScript types above may be uuid, text, varchar, timestamptz, etc.
// Table: consultation_sessions
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   query: text (not null)
//   response: text (not null)
//   timestamp: timestamp with time zone (nullable, default: now())
//   subject_id: uuid (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: flashcard_chat_sessions
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   flashcard_id: uuid (nullable)
//   query: text (not null)
//   response: text (not null)
//   timestamp: timestamp with time zone (nullable, default: now())
//   created_at: timestamp with time zone (nullable, default: now())
// Table: flashcards
//   id: uuid (not null, default: gen_random_uuid())
//   question: text (not null)
//   answer: text (not null)
//   subject_id: uuid (not null)
//   user_id: uuid (not null)
//   difficulty: integer (nullable, default: 0)
//   ease_factor: double precision (nullable, default: 2.5)
//   interval: integer (nullable, default: 0)
//   repetitions: integer (nullable, default: 0)
//   next_review_at: timestamp with time zone (nullable, default: now())
//   last_reviewed_at: timestamp with time zone (nullable)
//   is_generated_by_ai: boolean (nullable, default: false)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
// Table: profiles
//   id: uuid (not null)
//   email: text (not null)
//   name: text (nullable)
//   image: text (nullable)
//   onboarding_completed: boolean (nullable, default: false)
//   study_goals: _text (nullable, default: '{}'::text[])
//   learning_style: _text (nullable, default: '{}'::text[])
//   preferred_subjects: _text (nullable, default: '{}'::text[])
//   difficulty_subjects: _text (nullable, default: '{}'::text[])
//   study_hours_per_day: integer (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
// Table: progress_metrics
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   date: date (nullable, default: CURRENT_DATE)
//   study_time: integer (nullable, default: 0)
//   flashcards_reviewed: integer (nullable, default: 0)
//   correct_answers: integer (nullable, default: 0)
//   incorrect_answers: integer (nullable, default: 0)
//   retention_rate: double precision (nullable, default: 0.0)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: reminder_settings
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   email_enabled: boolean (nullable, default: true)
//   preferred_time: text (nullable, default: '08:00'::text)
//   frequency: text (nullable, default: 'daily'::text)
//   include_subjects: _text (nullable, default: '{}'::text[])
//   exclude_subjects: _text (nullable, default: '{}'::text[])
//   vacation_mode: boolean (nullable, default: false)
//   last_sent_at: timestamp with time zone (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
// Table: reviews
//   id: uuid (not null, default: gen_random_uuid())
//   flashcard_id: uuid (not null)
//   user_id: uuid (not null)
//   rating: integer (not null)
//   reviewed_at: timestamp with time zone (nullable, default: now())
//   created_at: timestamp with time zone (nullable, default: now())
// Table: subjects
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   color: text (nullable, default: '#3b82f6'::text)
//   user_id: uuid (not null)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())

// --- CONSTRAINTS ---
// Table: consultation_sessions
//   PRIMARY KEY consultation_sessions_pkey: PRIMARY KEY (id)
//   FOREIGN KEY consultation_sessions_subject_id_fkey: FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL
//   FOREIGN KEY consultation_sessions_user_id_fkey: FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
// Table: flashcard_chat_sessions
//   FOREIGN KEY flashcard_chat_sessions_flashcard_id_fkey: FOREIGN KEY (flashcard_id) REFERENCES flashcards(id) ON DELETE SET NULL
//   PRIMARY KEY flashcard_chat_sessions_pkey: PRIMARY KEY (id)
//   FOREIGN KEY flashcard_chat_sessions_user_id_fkey: FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
// Table: flashcards
//   PRIMARY KEY flashcards_pkey: PRIMARY KEY (id)
//   FOREIGN KEY flashcards_subject_id_fkey: FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
//   FOREIGN KEY flashcards_user_id_fkey: FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
// Table: profiles
//   FOREIGN KEY profiles_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY profiles_pkey: PRIMARY KEY (id)
// Table: progress_metrics
//   PRIMARY KEY progress_metrics_pkey: PRIMARY KEY (id)
//   UNIQUE progress_metrics_user_id_date_key: UNIQUE (user_id, date)
//   FOREIGN KEY progress_metrics_user_id_fkey: FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
// Table: reminder_settings
//   PRIMARY KEY reminder_settings_pkey: PRIMARY KEY (id)
//   FOREIGN KEY reminder_settings_user_id_fkey: FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
//   UNIQUE reminder_settings_user_id_key: UNIQUE (user_id)
// Table: reviews
//   FOREIGN KEY reviews_flashcard_id_fkey: FOREIGN KEY (flashcard_id) REFERENCES flashcards(id) ON DELETE CASCADE
//   PRIMARY KEY reviews_pkey: PRIMARY KEY (id)
//   FOREIGN KEY reviews_user_id_fkey: FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
// Table: subjects
//   PRIMARY KEY subjects_pkey: PRIMARY KEY (id)
//   FOREIGN KEY subjects_user_id_fkey: FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
//   UNIQUE subjects_user_id_name_key: UNIQUE (user_id, name)

// --- ROW LEVEL SECURITY POLICIES ---
// Table: consultation_sessions
//   Policy "Users can manage own consultations" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
// Table: flashcard_chat_sessions
//   Policy "Users can manage own flashcard chats" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
// Table: flashcards
//   Policy "Users can manage own flashcards" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
// Table: profiles
//   Policy "Users can update own profile" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = id)
//   Policy "Users can view own profile" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = id)
// Table: progress_metrics
//   Policy "Users can manage own progress metrics" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
// Table: reminder_settings
//   Policy "Users can manage own reminder settings" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
// Table: reviews
//   Policy "Users can manage own reviews" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
// Table: subjects
//   Policy "Users can manage own subjects" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)

// --- DATABASE FUNCTIONS ---
// FUNCTION handle_new_user()
//   CREATE OR REPLACE FUNCTION public.handle_new_user()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     INSERT INTO public.profiles (id, email)
//     VALUES (NEW.id, NEW.email);
//     RETURN NEW;
//   END;
//   $function$
//

// --- INDEXES ---
// Table: progress_metrics
//   CREATE UNIQUE INDEX progress_metrics_user_id_date_key ON public.progress_metrics USING btree (user_id, date)
// Table: reminder_settings
//   CREATE UNIQUE INDEX reminder_settings_user_id_key ON public.reminder_settings USING btree (user_id)
// Table: subjects
//   CREATE UNIQUE INDEX subjects_user_id_name_key ON public.subjects USING btree (user_id, name)
