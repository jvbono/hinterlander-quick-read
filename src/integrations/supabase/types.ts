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
      articles: {
        Row: {
          author: string | null
          canonical_url: string
          categories: string[] | null
          content_hash: string | null
          created_at: string | null
          description: string | null
          dropped_reason: string | null
          fetched_at: string | null
          id: string
          image_url: string | null
          lang: Database["public"]["Enums"]["article_lang"] | null
          published_at: string | null
          regions: string[] | null
          source_id: string | null
          status: Database["public"]["Enums"]["article_status"] | null
          target_column: Database["public"]["Enums"]["article_target"] | null
          title: string
          topics: string[] | null
          updated_at: string | null
          url_domain: string | null
          url_hash: string
        }
        Insert: {
          author?: string | null
          canonical_url: string
          categories?: string[] | null
          content_hash?: string | null
          created_at?: string | null
          description?: string | null
          dropped_reason?: string | null
          fetched_at?: string | null
          id?: string
          image_url?: string | null
          lang?: Database["public"]["Enums"]["article_lang"] | null
          published_at?: string | null
          regions?: string[] | null
          source_id?: string | null
          status?: Database["public"]["Enums"]["article_status"] | null
          target_column?: Database["public"]["Enums"]["article_target"] | null
          title: string
          topics?: string[] | null
          updated_at?: string | null
          url_domain?: string | null
          url_hash: string
        }
        Update: {
          author?: string | null
          canonical_url?: string
          categories?: string[] | null
          content_hash?: string | null
          created_at?: string | null
          description?: string | null
          dropped_reason?: string | null
          fetched_at?: string | null
          id?: string
          image_url?: string | null
          lang?: Database["public"]["Enums"]["article_lang"] | null
          published_at?: string | null
          regions?: string[] | null
          source_id?: string | null
          status?: Database["public"]["Enums"]["article_status"] | null
          target_column?: Database["public"]["Enums"]["article_target"] | null
          title?: string
          topics?: string[] | null
          updated_at?: string | null
          url_domain?: string | null
          url_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "articles_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      category_vocab: {
        Row: {
          created_at: string | null
          display_name: string | null
          slug: string
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          slug: string
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          slug?: string
        }
        Relationships: []
      }
      feed_errors: {
        Row: {
          created_at: string
          error_message: string
          http_status: number | null
          id: string
          run_id: string | null
          source_id: string
          source_name: string | null
          timestamp: string
        }
        Insert: {
          created_at?: string
          error_message: string
          http_status?: number | null
          id?: string
          run_id?: string | null
          source_id: string
          source_name?: string | null
          timestamp?: string
        }
        Update: {
          created_at?: string
          error_message?: string
          http_status?: number | null
          id?: string
          run_id?: string | null
          source_id?: string
          source_name?: string | null
          timestamp?: string
        }
        Relationships: []
      }
      fetch_logs: {
        Row: {
          error: string | null
          finished_at: string | null
          http_status: number | null
          id: number
          ok: boolean | null
          source_id: string | null
          started_at: string | null
        }
        Insert: {
          error?: string | null
          finished_at?: string | null
          http_status?: number | null
          id?: number
          ok?: boolean | null
          source_id?: string | null
          started_at?: string | null
        }
        Update: {
          error?: string | null
          finished_at?: string | null
          http_status?: number | null
          id?: number
          ok?: boolean | null
          source_id?: string | null
          started_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fetch_logs_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      mapping_rules: {
        Row: {
          created_at: string | null
          id: number
          pattern: string
          slug: string
          target_enum: string | null
          weight: number
        }
        Insert: {
          created_at?: string | null
          id?: number
          pattern: string
          slug: string
          target_enum?: string | null
          weight?: number
        }
        Update: {
          created_at?: string | null
          id?: number
          pattern?: string
          slug?: string
          target_enum?: string | null
          weight?: number
        }
        Relationships: []
      }
      raw_items: {
        Row: {
          fetched_at: string | null
          id: number
          item_json: Json
          source_id: string | null
        }
        Insert: {
          fetched_at?: string | null
          id?: number
          item_json: Json
          source_id?: string | null
        }
        Update: {
          fetched_at?: string | null
          id?: number
          item_json?: Json
          source_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "raw_items_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      region_vocab: {
        Row: {
          created_at: string | null
          display_name: string | null
          slug: string
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          slug: string
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          slug?: string
        }
        Relationships: []
      }
      review_queue: {
        Row: {
          article_id: string
          created_at: string | null
          reason: string
        }
        Insert: {
          article_id: string
          created_at?: string | null
          reason: string
        }
        Update: {
          article_id?: string
          created_at?: string | null
          reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_queue_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: true
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_queue_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: true
            referencedRelation: "v_commentary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_queue_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: true
            referencedRelation: "v_currents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_queue_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: true
            referencedRelation: "v_news"
            referencedColumns: ["id"]
          },
        ]
      }
      source_category_defaults: {
        Row: {
          category_slug: string
          source_id: string
        }
        Insert: {
          category_slug: string
          source_id: string
        }
        Update: {
          category_slug?: string
          source_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "source_category_defaults_category_slug_fkey"
            columns: ["category_slug"]
            isOneToOne: false
            referencedRelation: "category_vocab"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "source_category_defaults_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      source_region_defaults: {
        Row: {
          region_slug: string
          source_id: string
        }
        Insert: {
          region_slug: string
          source_id: string
        }
        Update: {
          region_slug?: string
          source_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "source_region_defaults_region_slug_fkey"
            columns: ["region_slug"]
            isOneToOne: false
            referencedRelation: "region_vocab"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "source_region_defaults_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      sources: {
        Row: {
          created_at: string | null
          default_target: Database["public"]["Enums"]["article_target"]
          id: string
          is_active: boolean | null
          last_seen_at: string | null
          name: string
          rss_url: string
          site_url: string
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          default_target: Database["public"]["Enums"]["article_target"]
          id?: string
          is_active?: boolean | null
          last_seen_at?: string | null
          name: string
          rss_url: string
          site_url: string
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          default_target?: Database["public"]["Enums"]["article_target"]
          id?: string
          is_active?: boolean | null
          last_seen_at?: string | null
          name?: string
          rss_url?: string
          site_url?: string
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      v_commentary: {
        Row: {
          author: string | null
          canonical_url: string | null
          categories: string[] | null
          content_hash: string | null
          created_at: string | null
          description: string | null
          dropped_reason: string | null
          fetched_at: string | null
          id: string | null
          image_url: string | null
          lang: Database["public"]["Enums"]["article_lang"] | null
          published_at: string | null
          regions: string[] | null
          source_id: string | null
          status: Database["public"]["Enums"]["article_status"] | null
          target_column: Database["public"]["Enums"]["article_target"] | null
          title: string | null
          topics: string[] | null
          updated_at: string | null
          url_domain: string | null
          url_hash: string | null
        }
        Insert: {
          author?: string | null
          canonical_url?: string | null
          categories?: string[] | null
          content_hash?: string | null
          created_at?: string | null
          description?: string | null
          dropped_reason?: string | null
          fetched_at?: string | null
          id?: string | null
          image_url?: string | null
          lang?: Database["public"]["Enums"]["article_lang"] | null
          published_at?: string | null
          regions?: string[] | null
          source_id?: string | null
          status?: Database["public"]["Enums"]["article_status"] | null
          target_column?: Database["public"]["Enums"]["article_target"] | null
          title?: string | null
          topics?: string[] | null
          updated_at?: string | null
          url_domain?: string | null
          url_hash?: string | null
        }
        Update: {
          author?: string | null
          canonical_url?: string | null
          categories?: string[] | null
          content_hash?: string | null
          created_at?: string | null
          description?: string | null
          dropped_reason?: string | null
          fetched_at?: string | null
          id?: string | null
          image_url?: string | null
          lang?: Database["public"]["Enums"]["article_lang"] | null
          published_at?: string | null
          regions?: string[] | null
          source_id?: string | null
          status?: Database["public"]["Enums"]["article_status"] | null
          target_column?: Database["public"]["Enums"]["article_target"] | null
          title?: string | null
          topics?: string[] | null
          updated_at?: string | null
          url_domain?: string | null
          url_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "articles_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      v_currents: {
        Row: {
          author: string | null
          canonical_url: string | null
          categories: string[] | null
          content_hash: string | null
          created_at: string | null
          description: string | null
          dropped_reason: string | null
          fetched_at: string | null
          id: string | null
          image_url: string | null
          lang: Database["public"]["Enums"]["article_lang"] | null
          published_at: string | null
          regions: string[] | null
          source_id: string | null
          status: Database["public"]["Enums"]["article_status"] | null
          target_column: Database["public"]["Enums"]["article_target"] | null
          title: string | null
          topics: string[] | null
          updated_at: string | null
          url_domain: string | null
          url_hash: string | null
        }
        Insert: {
          author?: string | null
          canonical_url?: string | null
          categories?: string[] | null
          content_hash?: string | null
          created_at?: string | null
          description?: string | null
          dropped_reason?: string | null
          fetched_at?: string | null
          id?: string | null
          image_url?: string | null
          lang?: Database["public"]["Enums"]["article_lang"] | null
          published_at?: string | null
          regions?: string[] | null
          source_id?: string | null
          status?: Database["public"]["Enums"]["article_status"] | null
          target_column?: Database["public"]["Enums"]["article_target"] | null
          title?: string | null
          topics?: string[] | null
          updated_at?: string | null
          url_domain?: string | null
          url_hash?: string | null
        }
        Update: {
          author?: string | null
          canonical_url?: string | null
          categories?: string[] | null
          content_hash?: string | null
          created_at?: string | null
          description?: string | null
          dropped_reason?: string | null
          fetched_at?: string | null
          id?: string | null
          image_url?: string | null
          lang?: Database["public"]["Enums"]["article_lang"] | null
          published_at?: string | null
          regions?: string[] | null
          source_id?: string | null
          status?: Database["public"]["Enums"]["article_status"] | null
          target_column?: Database["public"]["Enums"]["article_target"] | null
          title?: string | null
          topics?: string[] | null
          updated_at?: string | null
          url_domain?: string | null
          url_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "articles_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      v_news: {
        Row: {
          author: string | null
          canonical_url: string | null
          categories: string[] | null
          content_hash: string | null
          created_at: string | null
          description: string | null
          dropped_reason: string | null
          fetched_at: string | null
          id: string | null
          image_url: string | null
          lang: Database["public"]["Enums"]["article_lang"] | null
          published_at: string | null
          regions: string[] | null
          source_id: string | null
          status: Database["public"]["Enums"]["article_status"] | null
          target_column: Database["public"]["Enums"]["article_target"] | null
          title: string | null
          topics: string[] | null
          updated_at: string | null
          url_domain: string | null
          url_hash: string | null
        }
        Insert: {
          author?: string | null
          canonical_url?: string | null
          categories?: string[] | null
          content_hash?: string | null
          created_at?: string | null
          description?: string | null
          dropped_reason?: string | null
          fetched_at?: string | null
          id?: string | null
          image_url?: string | null
          lang?: Database["public"]["Enums"]["article_lang"] | null
          published_at?: string | null
          regions?: string[] | null
          source_id?: string | null
          status?: Database["public"]["Enums"]["article_status"] | null
          target_column?: Database["public"]["Enums"]["article_target"] | null
          title?: string | null
          topics?: string[] | null
          updated_at?: string | null
          url_domain?: string | null
          url_hash?: string | null
        }
        Update: {
          author?: string | null
          canonical_url?: string | null
          categories?: string[] | null
          content_hash?: string | null
          created_at?: string | null
          description?: string | null
          dropped_reason?: string | null
          fetched_at?: string | null
          id?: string | null
          image_url?: string | null
          lang?: Database["public"]["Enums"]["article_lang"] | null
          published_at?: string | null
          regions?: string[] | null
          source_id?: string | null
          status?: Database["public"]["Enums"]["article_status"] | null
          target_column?: Database["public"]["Enums"]["article_target"] | null
          title?: string | null
          topics?: string[] | null
          updated_at?: string | null
          url_domain?: string | null
          url_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "articles_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      article_lang: "en" | "fr" | "und"
      article_status: "pending" | "ready" | "dropped"
      article_target: "news" | "commentary" | "currents"
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
      article_lang: ["en", "fr", "und"],
      article_status: ["pending", "ready", "dropped"],
      article_target: ["news", "commentary", "currents"],
    },
  },
} as const
