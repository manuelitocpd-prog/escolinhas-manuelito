# Escolinhas Colégio Manuelito — Plano de Implementação

Sistema web de gestão das escolinhas esportivas, com dados reais persistidos no Lovable Cloud (banco de dados + login Google), identidade visual do colégio (azul #0592D9, roxo #600DAD, amarelo #F2EF72, branco) e aparência administrativa, limpa e profissional.

## Como será entregue

O sistema é grande. Para você poder usar e validar cada parte assim que ficar pronta, ele será construído em 4 etapas. Cada etapa entrega telas funcionais e salvando dados de verdade.

### Etapa 1 — Base, login e cadastros
- Ativação do Lovable Cloud (banco de dados + login com Google) e controle de acesso por perfil: Administrador e Colaborador (arquitetura pronta para novos perfis).
- Somente pessoas autorizadas entram; o primeiro acesso é Administrador.
- Layout geral: menu lateral (Dashboard, Alunos, Novas Matrículas, Modalidades, Professores, Turmas, Horários, Financeiro, Comunicação, Relatórios, PDFs, Configurações), busca global no topo e visual responsivo (computador, tablet, celular; tabelas viram cards no celular).
- Cadastros completos e editáveis: Modalidades (Balé, Futsal, Natação, Hidroginástica, Vôlei já criadas, todas editáveis), Professores, Turmas (com cálculo automático de vagas e marca "TURMA LOTADA"), Responsáveis.
- Alunos: cadastro, edição, lista com filtros e busca, idade calculada automaticamente, arquivamento (Ativo / Inativo / Arquivado) com confirmação antes de qualquer exclusão.

### Etapa 2 — Financeiro e regra de aptidão
- Mensalidades por aluno e por mês (valor, vencimento, pagamento, forma, observação, usuário que registrou). Histórico nunca é apagado.
- Registro de pagamento com mensagem de confirmação e liberação automática do aluno.
- Situação automática do aluno: APTO, NÃO APTO — PAGAMENTO PENDENTE, PAGAMENTO A VENCER, SUSPENSO, INATIVO — calculada sempre a partir das mensalidades.
- Perfil do aluno: dados pessoais, responsável, escolinha, situação em destaque, financeiro e histórico de alterações.
- Dashboard: cards (alunos ativos, aptos, pendentes, modalidades, turmas, professores), situação financeira com gráfico simples, próximos vencimentos e pagamentos vencidos.

### Etapa 3 — Novas matrículas, comunicação e horários
- Página independente de Novas Matrículas, com formulário em 3 etapas (aluno, responsável, escolinha), turmas carregadas conforme a modalidade, origem do interesse (opções editáveis), aula experimental, status (Interessado, Cadastro iniciado, Aguardando pagamento, Confirmada, Cancelado, Sem interesse), lista com filtros e resumo no dashboard.
- Botão "Confirmar matrícula": cria o aluno, vincula responsável/modalidade/turma, gera a mensalidade e reaproveita cadastros já existentes para não duplicar.
- Comunicação: próximos vencimentos, mensalidades vencidas e pagamentos recentes. Cada aluno tem "Enviar WhatsApp" (abre o WhatsApp com a mensagem pronta para o funcionário revisar e enviar) e "Copiar mensagem". Nenhuma automação, bot ou envio automático.
- Três mensagens editáveis nas Configurações (vencimento próximo, vencida, pagamento confirmado) com substituição automática de responsável, aluno, modalidade, mês, data e valor.
- Registro do histórico de comunicação (data, hora, usuário, tipo, aluno, responsável) apenas como "envio acionado".
- Quadro de Escolinhas e quadro semanal de Horários, gerados a partir das turmas — alterar a turma atualiza os quadros automaticamente.

### Etapa 4 — PDFs, avisos visuais, relatórios e configurações
- PDFs profissionais: horários geral e por modalidade, lista de alunos por modalidade, com cabeçalho do colégio e data de atualização, prontos para impressão e WhatsApp.
- Aviso visual de mensalidade: imagem personalizada nas cores do colégio, com opção de baixar.
- Relatórios com filtros e exportação (PDF e CSV/Excel respeitando os filtros aplicados): alunos ativos, aptos, pendentes, pagamentos do mês, inadimplência, por modalidade, por professor, novas matrículas e conversão.
- Configurações: dados do colégio, logo, modalidades, valores, formas de pagamento, mensagens, usuários e permissões, dias de antecedência do aviso de vencimento.
- Controle de Entrada (consulta rápida de aptidão), auditoria de alterações e estrutura preparada para frequência e importação de Excel/CSV no futuro.

## Detalhes técnicos

- Banco de dados relacional no Lovable Cloud com as tabelas: `profiles`/`user_roles`, `students`, `guardians`, `modalities`, `teachers`, `classes`, `enrollments`, `monthly_payments`, `payment_methods`, `communication_logs`, `experimental_classes`, `audit_logs`, `settings`, `leads` (novas matrículas) e `attendance` (estrutura futura).
- Perfis em tabela separada (`user_roles`) com função `has_role` para evitar escalonamento de privilégio; RLS ativa em todas as tabelas, acesso apenas a usuários autenticados e autorizados.
- Mudança de modalidade/turma preserva o histórico via `enrollments` (períodos), sem sobrescrever dados antigos.
- Aptidão calculada no banco a partir das mensalidades, não armazenada de forma solta, garantindo atualização imediata após pagamento.
- Valores, dias, horários, capacidades e mensagens ficam no banco, nunca fixos no código.
- Login Google pelo provedor gerenciado; sem senhas no sistema.
- PDFs e imagem de aviso gerados no próprio navegador, sem serviço externo.
- Auditoria por gatilhos/registros de alteração em cadastros e valores.

## Testes ao final de cada etapa
Login e logout, criação e edição de todos os cadastros, vínculo aluno-turma, registro de mensalidade e pagamento, mudança automática entre APTO e NÃO APTO, conversão de nova matrícula em aluno, cálculo de idade e de vagas, atualização automática do quadro de horários, geração de PDFs e do aviso visual, abertura do WhatsApp com mensagem preenchida, cópia de mensagem, histórico de comunicação, filtros, pesquisa, permissões, arquivamento e uso no celular.
