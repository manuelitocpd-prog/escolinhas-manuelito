# Finalizar o sistema: corrigir erros e criar as páginas que faltam

## 1. Corrigir os erros de compilação
- Ajustar tipos em `pdf.ts`, `audit.ts`, `messages.ts`, `WhatsAppActions.tsx` e `relatorios.tsx` (opcionais estritos, índices possivelmente indefinidos, `replaceAll`/tipos de célula do PDF).

## 2. Página Novas Matrículas (/matriculas)
- Lista com busca e filtros (período, modalidade, turma, status), resumo (interessados, aguardando, confirmadas no mês).
- Formulário em 3 etapas: aluno, responsável, escolinha (modalidade -> turmas com dias, horário, professor, valor, vagas). Origem do interesse e aula experimental (status, data, observação).
- Botão Confirmar matrícula: reutiliza aluno/responsável existentes, cria matrícula e primeira mensalidade, marca como confirmada e registra auditoria.

## 3. Página Configurações (/configuracoes)
- Dados do colégio (nome, logo, telefone, e-mail), dias de antecedência e dia de vencimento padrão.
- Edição das 3 mensagens de WhatsApp com os marcadores.
- Formas de pagamento e origens de interesse (adicionar/desativar).
- Usuários e permissões (apenas administrador altera papel).

## 4. Verificação
- Conferir compilação limpa e abrir as telas principais no navegador para checar que carregam.

## Detalhes técnicos
- Rotas `src/routes/_authenticated/matriculas.tsx` e `configuracoes.tsx` com `head()` próprios.
- Alteração de papéis via tabela `user_roles` respeitando RLS (somente admin).
