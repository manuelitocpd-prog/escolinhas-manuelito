import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_MESSAGES, type MessageKind } from "@/lib/messages";

export type StudentStatus = {
  id: string;
  name: string;
  birth_date: string | null;
  gender: string | null;
  guardian_id: string | null;
  school_grade: string | null;
  notes: string | null;
  enrollment_date: string;
  enrollment_status: string;
  created_at: string;
  guardian_name: string | null;
  guardian_phone: string | null;
  guardian_whatsapp: string | null;
  guardian_email: string | null;
  guardian_relationship: string | null;
  enrollment_id: string | null;
  modality_id: string | null;
  modality_name: string | null;
  class_id: string | null;
  class_name: string | null;
  class_days: string[] | null;
  start_time: string | null;
  end_time: string | null;
  teacher_id: string | null;
  teacher_name: string | null;
  monthly_fee: number | null;
  aptitude: "apto" | "nao_apto" | "a_vencer" | "suspenso" | "inativo";
  age: number | null;
};

export type ClassOverview = {
  id: string;
  name: string;
  modality_id: string;
  teacher_id: string | null;
  days: string[];
  start_time: string | null;
  end_time: string | null;
  price: number;
  capacity: number;
  notes: string | null;
  status: string;
  modality_name: string | null;
  teacher_name: string | null;
  active_students: number;
  available_spots: number;
};

export function useStudents() {
  return useQuery({
    queryKey: ["students_status"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students_status")
        .select("*")
        .order("name");
      if (error) throw error;
      return (data ?? []) as unknown as StudentStatus[];
    },
  });
}

export function useStudent(id: string) {
  return useQuery({
    queryKey: ["students_status", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students_status")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as StudentStatus | null;
    },
  });
}

export function useModalities() {
  return useQuery({
    queryKey: ["modalities"],
    queryFn: async () => {
      const { data, error } = await supabase.from("modalities").select("*").order("name");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useTeachers() {
  return useQuery({
    queryKey: ["teachers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("teachers").select("*").order("name");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useClasses() {
  return useQuery({
    queryKey: ["classes_overview"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("classes_overview")
        .select("*")
        .order("modality_name");
      if (error) throw error;
      return (data ?? []) as unknown as ClassOverview[];
    },
  });
}

export function useGuardians() {
  return useQuery({
    queryKey: ["guardians"],
    queryFn: async () => {
      const { data, error } = await supabase.from("guardians").select("*").order("name");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function usePaymentMethods() {
  return useQuery({
    queryKey: ["payment_methods"],
    queryFn: async () => {
      const { data, error } = await supabase.from("payment_methods").select("*").order("name");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export type PaymentRow = {
  id: string;
  student_id: string;
  enrollment_id: string | null;
  reference_month: string;
  amount: number;
  due_date: string;
  paid_at: string | null;
  payment_method_id: string | null;
  notes: string | null;
  recorded_by: string | null;
  created_at: string;
  students: { name: string; guardian_id: string | null } | null;
};

export function usePayments(studentId?: string) {
  return useQuery({
    queryKey: ["monthly_payments", studentId ?? "all"],
    queryFn: async () => {
      let q = supabase
        .from("monthly_payments")
        .select("*, students(name, guardian_id)")
        .order("due_date", { ascending: false });
      if (studentId) q = q.eq("student_id", studentId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as unknown as PaymentRow[];
    },
  });
}

export function useLeads() {
  return useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*, modalities(name), classes(name, days, start_time, end_time)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useLeadSources() {
  return useQuery({
    queryKey: ["lead_sources"],
    queryFn: async () => {
      const { data, error } = await supabase.from("lead_sources").select("*").order("name");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export type SchoolSettings = { name: string; phone: string; email: string; logo_url: string };
export type FinanceSettings = { due_soon_days: number; default_due_day: number };
export type MessageSettings = Record<MessageKind, string>;

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("settings").select("*");
      if (error) throw error;
      const map = new Map((data ?? []).map((row) => [row.key, row.value]));
      const school = {
        name: "Colégio Manuelito",
        phone: "",
        email: "",
        logo_url: "",
        ...(map.get("school") as object | undefined),
      } as SchoolSettings;
      const finance = {
        due_soon_days: 7,
        default_due_day: 10,
        ...(map.get("finance") as object | undefined),
      } as FinanceSettings;
      const messages = {
        ...DEFAULT_MESSAGES,
        ...(map.get("messages") as object | undefined),
      } as MessageSettings;
      return { school, finance, messages };
    },
  });
}

export async function saveSetting(key: string, value: unknown) {
  const { error } = await supabase
    .from("settings")
    .upsert({ key, value: value as never }, { onConflict: "key" });
  if (error) throw error;
}
