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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      audit_events: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          details: Json
          entity_id: string | null
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          entity_id?: string | null
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          entity_id?: string | null
          entity_type?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_events_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          label: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          label: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          label?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          created_at: string
          id: string
          label: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          slug?: string
        }
        Relationships: []
      }
      collection_items: {
        Row: {
          collection_id: string
          id: string
          server_id: string
          sort_order: number
        }
        Insert: {
          collection_id: string
          id?: string
          server_id: string
          sort_order?: number
        }
        Update: {
          collection_id?: string
          id?: string
          server_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "collection_items_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_items_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "servers"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          slug: string
          status: Database["public"]["Enums"]["server_status"]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          slug: string
          status?: Database["public"]["Enums"]["server_status"]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          slug?: string
          status?: Database["public"]["Enums"]["server_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collections_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      evidence_files: {
        Row: {
          created_at: string
          created_by: string | null
          file_name: string
          id: string
          mime_type: string | null
          review_id: string | null
          server_id: string | null
          sha256: string | null
          size_bytes: number | null
          storage_path: string
          visibility: Database["public"]["Enums"]["evidence_visibility"]
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          file_name: string
          id?: string
          mime_type?: string | null
          review_id?: string | null
          server_id?: string | null
          sha256?: string | null
          size_bytes?: number | null
          storage_path: string
          visibility?: Database["public"]["Enums"]["evidence_visibility"]
        }
        Update: {
          created_at?: string
          created_by?: string | null
          file_name?: string
          id?: string
          mime_type?: string | null
          review_id?: string | null
          server_id?: string | null
          sha256?: string | null
          size_bytes?: number | null
          storage_path?: string
          visibility?: Database["public"]["Enums"]["evidence_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "evidence_files_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidence_files_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidence_files_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "servers"
            referencedColumns: ["id"]
          },
        ]
      }
      guides: {
        Row: {
          body: string | null
          created_at: string
          created_by: string | null
          id: string
          slug: string
          status: Database["public"]["Enums"]["server_status"]
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          slug: string
          status?: Database["public"]["Enums"]["server_status"]
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          slug?: string
          status?: Database["public"]["Enums"]["server_status"]
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "guides_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      issue_reports: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          reporter_id: string | null
          server_id: string | null
          severity: string
          status: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          id?: string
          reporter_id?: string | null
          server_id?: string | null
          severity?: string
          status?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          reporter_id?: string | null
          server_id?: string | null
          severity?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "issue_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issue_reports_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "servers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      review_revisions: {
        Row: {
          body: string | null
          changes: Json
          created_at: string
          created_by: string | null
          id: string
          review_id: string
          revision_number: number
          summary: string
        }
        Insert: {
          body?: string | null
          changes?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          review_id: string
          revision_number?: number
          summary: string
        }
        Update: {
          body?: string | null
          changes?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          review_id?: string
          revision_number?: number
          summary?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_revisions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_revisions_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          checked_at: string | null
          created_at: string
          editor_id: string | null
          id: string
          publisher_claims: Json
          server_id: string
          source_material: Json
          status: Database["public"]["Enums"]["review_status"]
          summary: string
          tested_at: string | null
          updated_at: string
          verified_outcomes: Json
          version: string
        }
        Insert: {
          checked_at?: string | null
          created_at?: string
          editor_id?: string | null
          id?: string
          publisher_claims?: Json
          server_id: string
          source_material?: Json
          status?: Database["public"]["Enums"]["review_status"]
          summary: string
          tested_at?: string | null
          updated_at?: string
          verified_outcomes?: Json
          version: string
        }
        Update: {
          checked_at?: string | null
          created_at?: string
          editor_id?: string | null
          id?: string
          publisher_claims?: Json
          server_id?: string
          source_material?: Json
          status?: Database["public"]["Enums"]["review_status"]
          summary?: string
          tested_at?: string | null
          updated_at?: string
          verified_outcomes?: Json
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_editor_id_fkey"
            columns: ["editor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "servers"
            referencedColumns: ["id"]
          },
        ]
      }
      server_categories: {
        Row: {
          category_id: string
          created_at: string
          id: string
          server_id: string
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          server_id: string
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          server_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "server_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "server_categories_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "servers"
            referencedColumns: ["id"]
          },
        ]
      }
      server_client_support: {
        Row: {
          claimed_support: boolean
          client_id: string
          created_at: string
          id: string
          notes: string | null
          server_id: string
          tested_support: boolean
        }
        Insert: {
          claimed_support?: boolean
          client_id: string
          created_at?: string
          id?: string
          notes?: string | null
          server_id: string
          tested_support?: boolean
        }
        Update: {
          claimed_support?: boolean
          client_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          server_id?: string
          tested_support?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "server_client_support_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "server_client_support_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "servers"
            referencedColumns: ["id"]
          },
        ]
      }
      servers: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          hosting: string
          id: string
          metadata: Json
          name: string
          pricing: string
          published_at: string | null
          slug: string
          status: Database["public"]["Enums"]["server_status"]
          summary: string
          updated_at: string
          verified_at: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          created_by?: string | null
          hosting?: string
          id?: string
          metadata?: Json
          name: string
          pricing?: string
          published_at?: string | null
          slug: string
          status?: Database["public"]["Enums"]["server_status"]
          summary: string
          updated_at?: string
          verified_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          hosting?: string
          id?: string
          metadata?: Json
          name?: string
          pricing?: string
          published_at?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["server_status"]
          summary?: string
          updated_at?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "servers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      slug_redirects: {
        Row: {
          created_at: string
          server_id: string | null
          slug: string
          target_slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          server_id?: string | null
          slug: string
          target_slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          server_id?: string | null
          slug?: string
          target_slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "slug_redirects_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "servers"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          canonical_url: string | null
          created_at: string
          email: string | null
          id: string
          moderation_notes: string | null
          payload: Json
          server_name: string
          status: string
          submitter_id: string | null
          updated_at: string
        }
        Insert: {
          canonical_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          moderation_notes?: string | null
          payload?: Json
          server_name: string
          status?: string
          submitter_id?: string | null
          updated_at?: string
        }
        Update: {
          canonical_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          moderation_notes?: string | null
          payload?: Json
          server_name?: string
          status?: string
          submitter_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_submitter_id_fkey"
            columns: ["submitter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      test_results: {
        Row: {
          created_at: string
          id: string
          metric_name: string
          metric_value: string | null
          notes: string | null
          result: Database["public"]["Enums"]["test_status"]
          score: number | null
          test_run_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metric_name: string
          metric_value?: string | null
          notes?: string | null
          result?: Database["public"]["Enums"]["test_status"]
          score?: number | null
          test_run_id: string
        }
        Update: {
          created_at?: string
          id?: string
          metric_name?: string
          metric_value?: string | null
          notes?: string | null
          result?: Database["public"]["Enums"]["test_status"]
          score?: number | null
          test_run_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_results_test_run_id_fkey"
            columns: ["test_run_id"]
            isOneToOne: false
            referencedRelation: "test_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      test_runs: {
        Row: {
          created_at: string
          environment: string | null
          id: string
          name: string
          notes: string | null
          review_id: string
          scenario_version: string | null
          status: Database["public"]["Enums"]["test_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          environment?: string | null
          id?: string
          name: string
          notes?: string | null
          review_id: string
          scenario_version?: string | null
          status?: Database["public"]["Enums"]["test_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          environment?: string | null
          id?: string
          name?: string
          notes?: string | null
          review_id?: string
          scenario_version?: string | null
          status?: Database["public"]["Enums"]["test_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_runs_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
      is_editor_or_admin: { Args: never; Returns: boolean }
      is_safe_storage_upload: {
        Args: { bucket_id: string; mime_type: string; object_name: string }
        Returns: boolean
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      app_role: "visitor" | "member" | "developer" | "editor" | "admin"
      evidence_visibility: "private" | "published" | "redacted"
      review_status:
        | "draft"
        | "in_review"
        | "published"
        | "rejected"
        | "archived"
      server_status: "draft" | "review" | "published" | "archived"
      test_status: "not_tested" | "unknown" | "passed" | "failed" | "partial"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["visitor", "member", "developer", "editor", "admin"],
      evidence_visibility: ["private", "published", "redacted"],
      review_status: [
        "draft",
        "in_review",
        "published",
        "rejected",
        "archived",
      ],
      server_status: ["draft", "review", "published", "archived"],
      test_status: ["not_tested", "unknown", "passed", "failed", "partial"],
    },
  },
} as const
