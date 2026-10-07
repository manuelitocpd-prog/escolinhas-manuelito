# Corrigir erro ao ativar/desativar Formas de pagamento e Origens do interesse

## Causa (confirmada)
As listas "Formas de pagamento" e "Origens do interesse" têm uma regra automática que tenta gravar a "data da última alteração", mas essas duas listas não têm esse campo. Por isso qualquer alteração (desligar, renomear) falha com a mensagem `record "new" has no field "updated_at"`.

## Correção
- Adicionar o campo de data da última alteração às duas listas (preenchido automaticamente), mantendo a regra existente funcionando.
- Nenhuma mudança visual; os botões de liga/desliga e o menu "..." passam a salvar normalmente.

## Verificação
- Desligar e religar uma forma de pagamento e uma origem, confirmando que salva sem erro.

## Detalhes técnicos
Migração: `ALTER TABLE public.payment_methods ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();` e o mesmo para `public.lead_sources`. Os triggers `touch_payment_methods` e `touch_lead_sources` continuam.
