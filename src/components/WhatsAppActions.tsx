import { useState } from "react";
import { toast } from "sonner";
import { Copy, ImageIcon, MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { logCommunication } from "@/lib/audit";
import { whatsappLink } from "@/lib/format";
import { fillTemplate, MESSAGE_LABEL, type MessageKind, type MessageContext } from "@/lib/messages";
import { buildNoticeImage, downloadDataUrl } from "@/lib/notice-image";
import { useSettings } from "@/lib/data";

export type WhatsAppTarget = MessageContext & {
  studentId?: string | null;
  guardianId?: string | null;
  paymentId?: string | null;
  whatsapp?: string | null;
};

export function WhatsAppActions({
  target,
  kind,
  compact = false,
  showNotice = true,
}: {
  target: WhatsAppTarget;
  kind: MessageKind;
  compact?: boolean;
  showNotice?: boolean;
}) {
  const { data: settings } = useSettings();
  const [noticeUrl, setNoticeUrl] = useState<string | null>(null);

  const template = settings?.messages[kind] ?? "";
  const message = fillTemplate(template, target);

  async function register() {
    await logCommunication({
      studentId: target.studentId,
      guardianId: target.guardianId,
      paymentId: target.paymentId,
      type: MESSAGE_LABEL[kind],
      message,
    });
  }

  async function sendWhatsapp() {
    if (!target.whatsapp) {
      toast.error("Este responsável não possui WhatsApp cadastrado.");
      return;
    }
    window.open(whatsappLink(target.whatsapp, message), "_blank", "noopener");
    await register();
    toast.success("WhatsApp aberto com a mensagem preenchida. Revise e envie manualmente.");
  }

  async function copyMessage() {
    await navigator.clipboard.writeText(message);
    await register();
    toast.success("Mensagem copiada.");
  }

  function openNotice() {
    const url = buildNoticeImage({
      guardianName: target.guardianName || "responsável",
      studentName: target.studentName || "aluno(a)",
      modality: target.modality || "—",
      referenceMonth: target.referenceMonth ?? null,
      dueDate: target.dueDate ?? null,
      amount: target.amount ?? 0,
      schoolName: settings?.school.name,
    });
    setNoticeUrl(url);
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button size={compact ? "sm" : "default"} onClick={sendWhatsapp}>
          <MessageCircle className="mr-1 size-4" /> Enviar WhatsApp
        </Button>
        <Button size={compact ? "sm" : "default"} variant="outline" onClick={copyMessage}>
          <Copy className="mr-1 size-4" /> Copiar mensagem
        </Button>
        {showNotice ? (
          <Button size={compact ? "sm" : "default"} variant="outline" onClick={openNotice}>
            <ImageIcon className="mr-1 size-4" /> Gerar aviso visual
          </Button>
        ) : null}
      </div>

      <Dialog open={!!noticeUrl} onOpenChange={(open) => !open && setNoticeUrl(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Aviso visual de mensalidade</DialogTitle>
          </DialogHeader>
          {noticeUrl ? (
            <div className="space-y-4">
              <img src={noticeUrl} alt="Aviso de mensalidade" className="w-full rounded-lg border" />
              <Button
                className="w-full"
                onClick={() =>
                  downloadDataUrl(noticeUrl, `aviso-${(target.studentName ?? "aluno").toLowerCase()}.png`)
                }
              >
                Baixar imagem
              </Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

export function MessagePreview({ message }: { message: string }) {
  return (
    <pre className="max-h-64 overflow-auto rounded-lg bg-muted p-3 text-xs whitespace-pre-wrap">
      {message}
    </pre>
  );
}
