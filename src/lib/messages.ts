import { formatCurrency, formatDate, formatMonth } from "./format";

export type MessageKind = "due_soon" | "overdue" | "paid";

export const MESSAGE_LABEL: Record<MessageKind, string> = {
  due_soon: "Lembrete de vencimento",
  overdue: "Cobrança de mensalidade vencida",
  paid: "Confirmação de pagamento",
};

export type MessageContext = {
  guardianName?: string | null;
  studentName?: string | null;
  modality?: string | null;
  referenceMonth?: string | null;
  dueDate?: string | null;
  amount?: number | string | null;
};

export function fillTemplate(template: string, ctx: MessageContext): string {
  return template
    .replaceAll("[NOME DO RESPONSÁVEL]", ctx.guardianName || "responsável")
    .replaceAll("[NOME DO ALUNO]", ctx.studentName || "aluno(a)")
    .replaceAll("[MODALIDADE]", ctx.modality || "—")
    .replaceAll("[MÊS]", formatMonth(ctx.referenceMonth))
    .replaceAll("[DATA]", formatDate(ctx.dueDate))
    .replaceAll("[VALOR]", formatCurrency(ctx.amount));
}

export const DEFAULT_MESSAGES: Record<MessageKind, string> = {
  due_soon:
    "Olá, [NOME DO RESPONSÁVEL]! 😊\n\nPassando para lembrar que a mensalidade da escolinha de [MODALIDADE], referente a [MÊS], tem vencimento em [DATA].\n\n💙 Valor: [VALOR]\n\nPara manter a participação do(a) aluno(a) [NOME DO ALUNO] nas atividades, pedimos que a mensalidade seja regularizada dentro do prazo.\n\nQualquer dúvida ou necessidade de informação, estamos à disposição.\n\nColégio Manuelito\nEscolinhas Esportivas",
  overdue:
    "Olá, [NOME DO RESPONSÁVEL]!\n\nIdentificamos que a mensalidade da escolinha de [MODALIDADE], referente a [MÊS], ainda consta como pendente em nosso sistema.\n\nValor: [VALOR]\nVencimento: [DATA]\n\nLembramos que a participação nas atividades fica condicionada à regularização da mensalidade.\n\nCaso o pagamento já tenha sido realizado, por favor, desconsidere esta mensagem ou entre em contato para conferirmos a situação.\n\nAgradecemos a compreensão e a parceria.\n\nColégio Manuelito\nEscolinhas Esportivas",
  paid:
    "Olá, [NOME DO RESPONSÁVEL]! 😊\n\nConfirmamos o recebimento da mensalidade da escolinha de [MODALIDADE], referente a [MÊS].\n\n💙 Pagamento registrado com sucesso!\n\nO(a) aluno(a) [NOME DO ALUNO] está com a mensalidade regularizada e apto(a) a participar das atividades.\n\nAgradecemos pela parceria!\n\nColégio Manuelito",
};
