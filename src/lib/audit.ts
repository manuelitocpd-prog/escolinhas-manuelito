import { supabase } from "@/integrations/supabase/client";

export async function logAudit(params: {
  entity: string;
  entityId?: string | null;
  action: string;
  description?: string;
}) {
  const { data } = await supabase.auth.getUser();
  await supabase.from("audit_logs").insert({
    entity: params.entity,
    entity_id: params.entityId ?? null,
    action: params.action,
    description: params.description ?? null,
    user_id: data.user?.id ?? null,
  });
}

export async function logCommunication(params: {
  studentId?: string | null;
  guardianId?: string | null;
  paymentId?: string | null;
  type: string;
  message: string;
}) {
  const { data } = await supabase.auth.getUser();
  await supabase.from("communication_logs").insert({
    student_id: params.studentId ?? null,
    guardian_id: params.guardianId ?? null,
    payment_id: params.paymentId ?? null,
    type: params.type,
    message: params.message,
    user_id: data.user?.id ?? null,
  });
}
