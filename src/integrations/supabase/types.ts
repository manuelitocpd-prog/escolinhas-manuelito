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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      attendance: {
        Row: {
          class_id: string | null
          created_at: string
          date: string
          id: string
          notes: string | null
          status: string
          student_id: string
        }
        Insert: {
          class_id?: string | null
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          status?: string
          student_id: string
        }
        Update: {
          class_id?: string | null
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students_status"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          description: string | null
          entity: string
          entity_id: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          description?: string | null
          entity: string
          entity_id?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          description?: string | null
          entity?: string
          entity_id?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      classes: {
        Row: {
          capacity: number
          created_at: string
          days: string[]
          end_time: string | null
          id: string
          modality_id: string
          name: string
          notes: string | null
          price: number
          start_time: string | null
          status: string
          teacher_id: string | null
          updated_at: string
        }
        Insert: {
          capacity?: number
          created_at?: string
          days?: string[]
          end_time?: string | null
          id?: string
          modality_id: string
          name: string
          notes?: string | null
          price?: number
          start_time?: string | null
          status?: string
          teacher_id?: string | null
          updated_at?: string
        }
        Update: {
          capacity?: number
          created_at?: string
          days?: string[]
          end_time?: string | null
          id?: string
          modality_id?: string
          name?: string
          notes?: string | null
          price?: number
          start_time?: string | null
          status?: string
          teacher_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classes_modality_id_fkey"
            columns: ["modality_id"]
            isOneToOne: false
            referencedRelation: "modalities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_logs: {
        Row: {
          channel: string
          created_at: string
          guardian_id: string | null
          id: string
          message: string | null
          payment_id: string | null
          student_id: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          channel?: string
          created_at?: string
          guardian_id?: string | null
          id?: string
          message?: string | null
          payment_id?: string | null
          student_id?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          channel?: string
          created_at?: string
          guardian_id?: string | null
          id?: string
          message?: string | null
          payment_id?: string | null
          student_id?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communication_logs_guardian_id_fkey"
            columns: ["guardian_id"]
            isOneToOne: false
            referencedRelation: "guardians"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_logs_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "monthly_payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_logs_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_logs_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students_status"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          active: boolean
          class_id: string | null
          created_at: string
          end_date: string | null
          id: string
          modality_id: string
          monthly_fee: number
          start_date: string
          student_id: string
        }
        Insert: {
          active?: boolean
          class_id?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          modality_id: string
          monthly_fee?: number
          start_date?: string
          student_id: string
        }
        Update: {
          active?: boolean
          class_id?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          modality_id?: string
          monthly_fee?: number
          start_date?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_modality_id_fkey"
            columns: ["modality_id"]
            isOneToOne: false
            referencedRelation: "modalities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students_status"
            referencedColumns: ["id"]
          },
        ]
      }
      guardians: {
        Row: {
          address: string | null
          cpf: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          relationship: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          relationship?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          relationship?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      lead_sources: {
        Row: {
          active: boolean
          id: string
          name: string
        }
        Insert: {
          active?: boolean
          id?: string
          name: string
        }
        Update: {
          active?: boolean
          id?: string
          name?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          birth_date: string | null
          class_id: string | null
          converted_student_id: string | null
          created_at: string
          gender: string | null
          guardian_address: string | null
          guardian_cpf: string | null
          guardian_email: string | null
          guardian_name: string | null
          guardian_phone: string | null
          guardian_relationship: string | null
          guardian_whatsapp: string | null
          id: string
          modality_id: string | null
          school_grade: string | null
          source: string | null
          status: string
          student_name: string
          student_notes: string | null
          trial_date: string | null
          trial_notes: string | null
          trial_status: string | null
          updated_at: string
        }
        Insert: {
          birth_date?: string | null
          class_id?: string | null
          converted_student_id?: string | null
          created_at?: string
          gender?: string | null
          guardian_address?: string | null
          guardian_cpf?: string | null
          guardian_email?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          guardian_relationship?: string | null
          guardian_whatsapp?: string | null
          id?: string
          modality_id?: string | null
          school_grade?: string | null
          source?: string | null
          status?: string
          student_name: string
          student_notes?: string | null
          trial_date?: string | null
          trial_notes?: string | null
          trial_status?: string | null
          updated_at?: string
        }
        Update: {
          birth_date?: string | null
          class_id?: string | null
          converted_student_id?: string | null
          created_at?: string
          gender?: string | null
          guardian_address?: string | null
          guardian_cpf?: string | null
          guardian_email?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          guardian_relationship?: string | null
          guardian_whatsapp?: string | null
          id?: string
          modality_id?: string | null
          school_grade?: string | null
          source?: string | null
          status?: string
          student_name?: string
          student_notes?: string | null
          trial_date?: string | null
          trial_notes?: string | null
          trial_status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_converted_student_id_fkey"
            columns: ["converted_student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_converted_student_id_fkey"
            columns: ["converted_student_id"]
            isOneToOne: false
            referencedRelation: "students_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_modality_id_fkey"
            columns: ["modality_id"]
            isOneToOne: false
            referencedRelation: "modalities"
            referencedColumns: ["id"]
          },
        ]
      }
      modalities: {
        Row: {
          archived: boolean
          created_at: string
          default_price: number
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          archived?: boolean
          created_at?: string
          default_price?: number
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          archived?: boolean
          created_at?: string
          default_price?: number
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      monthly_payments: {
        Row: {
          amount: number
          created_at: string
          due_date: string
          enrollment_id: string | null
          id: string
          notes: string | null
          paid_at: string | null
          payment_method_id: string | null
          recorded_by: string | null
          reference_month: string
          student_id: string
          updated_at: string
        }
        Insert: {
          amount?: number
          created_at?: string
          due_date: string
          enrollment_id?: string | null
          id?: string
          notes?: string | null
          paid_at?: string | null
          payment_method_id?: string | null
          recorded_by?: string | null
          reference_month: string
          student_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string
          enrollment_id?: string | null
          id?: string
          notes?: string | null
          paid_at?: string | null
          payment_method_id?: string | null
          recorded_by?: string | null
          reference_month?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "monthly_payments_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_payments_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "students_status"
            referencedColumns: ["enrollment_id"]
          },
          {
            foreignKeyName: "monthly_payments_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students_status"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          active: boolean
          id: string
          name: string
        }
        Insert: {
          active?: boolean
          id?: string
          name: string
        }
        Update: {
          active?: boolean
          id?: string
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      students: {
        Row: {
          birth_date: string | null
          created_at: string
          enrollment_date: string
          gender: string | null
          guardian_id: string | null
          id: string
          name: string
          notes: string | null
          school_grade: string | null
          status: string
          updated_at: string
        }
        Insert: {
          birth_date?: string | null
          created_at?: string
          enrollment_date?: string
          gender?: string | null
          guardian_id?: string | null
          id?: string
          name: string
          notes?: string | null
          school_grade?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          birth_date?: string | null
          created_at?: string
          enrollment_date?: string
          gender?: string | null
          guardian_id?: string | null
          id?: string
          name?: string
          notes?: string | null
          school_grade?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_guardian_id_fkey"
            columns: ["guardian_id"]
            isOneToOne: false
            referencedRelation: "guardians"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers: {
        Row: {
          active: boolean
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      classes_overview: {
        Row: {
          active_students: number | null
          available_spots: number | null
          capacity: number | null
          created_at: string | null
          days: string[] | null
          end_time: string | null
          id: string | null
          modality_id: string | null
          modality_name: string | null
          name: string | null
          notes: string | null
          price: number | null
          start_time: string | null
          status: string | null
          teacher_id: string | null
          teacher_name: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classes_modality_id_fkey"
            columns: ["modality_id"]
            isOneToOne: false
            referencedRelation: "modalities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      students_status: {
        Row: {
          age: number | null
          aptitude: string | null
          birth_date: string | null
          class_days: string[] | null
          class_id: string | null
          class_name: string | null
          created_at: string | null
          end_time: string | null
          enrollment_date: string | null
          enrollment_id: string | null
          enrollment_status: string | null
          gender: string | null
          guardian_email: string | null
          guardian_id: string | null
          guardian_name: string | null
          guardian_phone: string | null
          guardian_relationship: string | null
          guardian_whatsapp: string | null
          id: string | null
          modality_id: string | null
          modality_name: string | null
          monthly_fee: number | null
          name: string | null
          notes: string | null
          school_grade: string | null
          start_time: string | null
          teacher_id: string | null
          teacher_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classes_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_modality_id_fkey"
            columns: ["modality_id"]
            isOneToOne: false
            referencedRelation: "modalities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_guardian_id_fkey"
            columns: ["guardian_id"]
            isOneToOne: false
            referencedRelation: "guardians"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "colaborador"
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
      app_role: ["admin", "colaborador"],
    },
  },
} as const
