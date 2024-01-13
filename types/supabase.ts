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
      credentials: {
        Row: {
          credential_detail: string | null
          credential_name: string
          credential_type: string
          id: string
        }
        Insert: {
          credential_detail?: string | null
          credential_name: string
          credential_type: string
          id?: string
        }
        Update: {
          credential_detail?: string | null
          credential_name?: string
          credential_type?: string
          id?: string
        }
        Relationships: []
      }
      options: {
        Row: {
          id: string
          option_description: string
          poll_id: string | null
          total_weight: number | null
          votes: number | null
        }
        Insert: {
          id?: string
          option_description: string
          poll_id?: string | null
          total_weight?: number | null
          votes?: number | null
        }
        Update: {
          id?: string
          option_description?: string
          poll_id?: string | null
          total_weight?: number | null
          votes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "options_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          }
        ]
      }
      pollcredentials: {
        Row: {
          credential_id: string | null
          id: string
          poll_id: string | null
        }
        Insert: {
          credential_id?: string | null
          id?: string
          poll_id?: string | null
        }
        Update: {
          credential_id?: string | null
          id?: string
          poll_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pollcredentials_credential_id_fkey"
            columns: ["credential_id"]
            isOneToOne: false
            referencedRelation: "credentials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pollcredentials_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          }
        ]
      }
      polls: {
        Row: {
          created_at: string
          description: string | null
          id: string
          poap_events: string[] | null
          time_limit: number | null
          title: string
          votingMethod: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          poap_events?: string[] | null
          time_limit?: number | null
          title: string
          votingMethod?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          poap_events?: string[] | null
          time_limit?: number | null
          title?: string
          votingMethod?: string | null
        }
        Relationships: []
      }
      "Protocol Guild Member": {
        Row: {
          "0xEB34BD135aFc3054667ca74C9d19fbCD7D05F79F": string
          "1.1569": number | null
          id: string
        }
        Insert: {
          "0xEB34BD135aFc3054667ca74C9d19fbCD7D05F79F": string
          "1.1569"?: number | null
          id?: string
        }
        Update: {
          "0xEB34BD135aFc3054667ca74C9d19fbCD7D05F79F"?: string
          "1.1569"?: number | null
          id?: string
        }
        Relationships: []
      }
      votes: {
        Row: {
          cast_at: string
          id: string
          option_id: string | null
          poll_id: string | null
          vote_hash: string
          weight: number | null
        }
        Insert: {
          cast_at: string
          id?: string
          option_id?: string | null
          poll_id?: string | null
          vote_hash: string
          weight?: number | null
        }
        Update: {
          cast_at?: string
          id?: string
          option_id?: string | null
          poll_id?: string | null
          vote_hash?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "votes_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrement_vote: {
        Args: {
          option_id_param: string
        }
        Returns: undefined
      }
      increment_vote: {
        Args: {
          option_id_param: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never
