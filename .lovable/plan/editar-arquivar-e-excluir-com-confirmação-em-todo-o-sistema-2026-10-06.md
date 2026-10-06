# Editar, Arquivar e Excluir com confirmação em todo o sistema

## O que muda para o usuário
- Todo cadastro ganha **Editar** e **Excluir**. Quando o registro tem histórico, ganha também **Arquivar**: alunos, responsáveis, novas matrículas, professores, modalidades, turmas, mensalidades/pagamentos, formas de pagamento, origens do interesse e usuários.
- As ações ficam nas páginas individuais e num menu "⋯" em cada linha das tabelas, inclusive no celular.
- Nenhuma exclusão acontece com um clique só. Sempre abre uma janela que diz o que vai ser apagado e quantos vínculos existem. Ela tem o botão **Cancelar** (neutro) e o botão vermelho **Confirmar exclusão**.
- Mensagens personalizadas: aluno, professor (número de turmas), turma (número de alunos), modalidade, interessado e pagamento. No pagamento aparecem valor, mês e aluno, com o aviso de que a aptidão pode mudar.

## Proteção de vínculos
- Antes de excluir, o sistema conta os vínculos:
  - Professor → turmas
  - Turma → alunos ativos
  - Modalidade → turmas e alunos
  - Aluno → matrículas e pagamentos
  - Responsável → alunos
- Com vínculos, a exclusão é bloqueada com a mensagem "⚠️ Não foi possível excluir…", que explica o motivo. As alternativas oferecidas são **Voltar**, **Ver vinculados** e **Arquivar**.
- Professor: no lugar de excluir, há a opção **Substituir professor nas turmas**, que passa as turmas dele para outro professor.
- Turma: há a opção **Transferir alunos** para outra turma, e o histórico é mantido.

## Arquivamento
- **Aluno:** passa a ter o status "arquivado". Sai das listas de ativos, mas mantém o histórico e os pagamentos. O botão **♻️ Reativar aluno** traz o aluno de volta.
- **Turma** arquivada não aparece para novas matrículas nem em Horários. **Modalidade** arquivada não aparece para novas turmas nem para matrículas. **Professor** arquivado fica inativo.
- Cada lista ganha o filtro "Mostrar arquivados".

## Auditoria e retorno
- Toda ação de editar, arquivar, excluir ou reativar fica registrada. O registro guarda o usuário, a data e hora, o tipo de cadastro, o nome do registro e a ação. Exemplo: "Administrador arquivou a turma Futsal — Seg/Qua — 11h".
- Mensagens após cada ação: "✅ Registro excluído com sucesso." e "✅ Registro arquivado com sucesso.".
- Depois de cada ação, o painel e as listas se atualizam sozinhos.

## Permissões
- Somente administradores podem excluir. Colaboradores podem editar e arquivar. Essa regra já é aplicada pelo banco de dados.
- Excluir um pagamento é sempre manual, só para administrador, com confirmação reforçada. A situação do aluno é recalculada na hora. Nada financeiro é apagado automaticamente.

## Detalhes técnicos
- Componente único `ConfirmActionDialog`, feito a partir do AlertDialog: título, descrição, contagem de vínculos, ações alternativas e variante destrutiva.
- Componente `RowActions`, um DropdownMenu com Editar, Arquivar ou Reativar e Excluir.
- Módulo `src/lib/records.ts`. Ele conta os vínculos de cada cadastro com consultas `count` e faz as operações de arquivar, excluir e reativar, que chamam `logAudit` com o nome do registro e depois `invalidateQueries`.
- Migração pequena: adicionar o status "arquivado" a students (o campo status já é texto) e `archived` a guardians e leads, se necessário. Ajustar as views para ignorar arquivados nas listas de "disponíveis". Também faltam diálogos de edição para pagamento (valor, vencimento, forma, observação) e responsável.
- Exclusões só depois de checar vínculos no cliente. As chaves estrangeiras continuam sem cascade, então o banco recusa qualquer exclusão que deixaria registros quebrados.
