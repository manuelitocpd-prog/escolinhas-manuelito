# Manuelito Schools Hub

Crie um sistema web responsivo e funcional chamado “Escolinhas Colégio Manuelito”, desenvolvido para a gestão completa dos alunos matriculados nas escolinhas esportivas do Colégio Manuelito.

O sistema deverá centralizar:

cadastro de alunos;

responsáveis;

novas matrículas;

modalidades;

turmas;

professores;

horários;

mensalidades;

pagamentos;

situação de aptidão do aluno;

comunicação com responsáveis;

relatórios;

geração de PDFs.

O principal objetivo do sistema é permitir que a equipe administrativa saiba rapidamente quem está com a mensalidade regularizada e pode participar das atividades e quem possui pendência e não está autorizado a frequentar, além de facilitar a gestão geral das escolinhas.

1. IDENTIDADE DO SISTEMA

Nome:

Escolinhas Colégio Manuelito

Subtítulo:

Gestão de alunos, turmas, pagamentos e atividades

O sistema deve utilizar a identidade visual do Colégio Manuelito.

Cores:

Azul principal: #0592D9

Roxo: #600DAD

Amarelo: #F2EF72

Branco

Utilizar as cores com equilíbrio.

O sistema deve ter aparência:

profissional;

moderna;

limpa;

administrativa;

intuitiva;

acolhedora.

Evitar aparência excessivamente infantil.

2. AUTENTICAÇÃO

Implementar login através de Google/Gmail.

Somente usuários autorizados poderão acessar o sistema.

Criar estrutura para controle de permissões.

Administrador

Pode:

cadastrar;

editar;

arquivar;

consultar;

excluir quando permitido;

registrar pagamentos;

alterar valores;

cadastrar modalidades;

cadastrar turmas;

cadastrar professores;

gerar relatórios;

gerar PDFs;

acessar configurações;

gerenciar usuários.

Colaborador

Pode:

consultar alunos;

consultar modalidades;

consultar turmas;

consultar horários;

consultar situação financeira;

registrar pagamentos, se autorizado;

gerar PDFs.

Deixar a arquitetura preparada para novos níveis de permissão futuramente.

3. DASHBOARD

Após o login, apresentar o Dashboard.

Título:

Escolinhas Colégio Manuelito

Subtítulo:

Gestão das escolinhas esportivas

Exibir cards:

Alunos ativos

Quantidade total.

Alunos aptos

Quantidade de alunos liberados para participar.

Alunos pendentes

Quantidade de alunos com mensalidade pendente.

Modalidades

Quantidade de modalidades cadastradas.

Turmas

Quantidade de turmas.

Professores

Quantidade de professores ativos.

Situação financeira

Criar seção:

Situação financeira atual

Mostrar:

mensalidades previstas;

mensalidades pagas;

mensalidades pendentes;

valor recebido;

valor pendente.

Utilizar gráfico simples.

Mensalidades próximas do vencimento

Criar seção:

🔔 Próximos vencimentos

Mostrar alunos cuja mensalidade vencerá nos próximos dias.

Exemplo:

Maria Silva
Futsal — R$ 40,00
Vencimento: 10/10/2026

Botões:

Ver aluno

📱 Enviar lembrete

Mensalidades vencidas

Criar seção:

🔴 Pagamentos pendentes

Mostrar os alunos com mensalidade vencida.

Botão:

Ver pendências

4. REGRA PRINCIPAL DO SISTEMA

Esta é uma das regras mais importantes da aplicação.

O sistema deverá determinar automaticamente se o aluno está apto ou não apto a frequentar a escolinha, com base na situação da mensalidade.

Criar os seguintes status:

🟢 APTO A FREQUENTAR

Mensalidade regularizada.

🔴 NÃO APTO — PAGAMENTO PENDENTE

Existe mensalidade vencida e não regularizada.

🟡 PAGAMENTO A VENCER

Mensalidade ainda não venceu.

⚪ SUSPENSO

Aluno temporariamente suspenso.

⚫ INATIVO

Aluno não está mais matriculado.

5. REGRA DE APTIDÃO

Se a mensalidade estiver:

Paga → 🟢 APTO

Se estiver:

A vencer → 🟡 A VENCER

Se estiver:

Vencida e não paga → 🔴 NÃO APTO

Se o aluno estiver suspenso:

⚪ SUSPENSO

Se a matrícula estiver encerrada:

⚫ INATIVO

Quando um pagamento pendente for registrado, o sistema deverá atualizar automaticamente a situação do aluno.

Exemplo:

Antes:

🔴 NÃO APTO — PAGAMENTO PENDENTE

Depois do pagamento:

🟢 APTO A FREQUENTAR

6. CADASTRO DE ALUNOS

Criar página:

Alunos

Campos:

nome completo;

data de nascimento;

idade calculada automaticamente;

sexo;

responsável;

telefone;

WhatsApp;

e-mail;

modalidade;

turma;

professor;

dias;

horário;

valor da mensalidade;

data de matrícula;

status da matrícula;

status financeiro;

observações.

7. LISTA DE ALUNOS

Criar tabela com:

AlunoIdadeModalidadeTurmaResponsávelSituaçãoJoão Silva10FutsalSeg/QuaMaria Silva🟢 AptoPedro Santos9BaléTer/QuiAna Santos🔴 Pendente

Filtros:

todos;

aptos;

pendentes;

a vencer;

suspensos;

inativos;

modalidade;

turma;

professor.

Criar busca por nome.

8. PERFIL DO ALUNO

Ao clicar em um aluno, abrir página completa.

Dados pessoais

nome;

nascimento;

idade;

sexo.

Responsável

nome;

parentesco;

telefone;

WhatsApp;

e-mail.

Escolinha

modalidade;

turma;

professor;

dias;

horário;

valor.

Situação atual

Mostrar em destaque:

🟢 APTO A FREQUENTAR

ou

🔴 NÃO APTO — PAGAMENTO PENDENTE

Financeiro

Mostrar mensalidade atual e histórico.

Histórico

Registrar:

matrícula;

alterações;

pagamentos;

mudanças de modalidade;

mudanças de turma;

suspensões;

cancelamentos;

reativações.

9. FINANCEIRO / MENSALIDADES

Criar página:

Financeiro

Cada aluno deverá possuir histórico mensal.

Exemplo:

MêsValorVencimentoPagamentoSituaçãoAgosto/2026R$ 40,0010/0808/08PagoSetembro/2026R$ 40,0010/09—PendenteOutubro/2026R$ 40,0010/10—A vencer

Campos:

mês de referência;

valor;

vencimento;

data do pagamento;

forma de pagamento;

observação;

usuário que registrou.

Formas:

Pix;

dinheiro;

cartão;

transferência;

outro.

Nunca apagar o histórico financeiro.

10. REGISTRO DE PAGAMENTO

Criar botão:

+ Registrar pagamento

Após o registro:

atualizar situação financeira;

atualizar situação de aptidão;

registrar data;

registrar usuário;

manter histórico.

Mostrar mensagem:

✅ Pagamento registrado com sucesso.

Aluno liberado para frequentar as atividades.

11. MODALIDADES

Criar página:

Modalidades

Cadastrar inicialmente:

Balé;

Futsal;

Natação;

Hidroginástica;

Vôlei.

Mas deixar tudo editável.

Permitir:

criar;

editar;

arquivar;

visualizar.

Cada modalidade deverá mostrar:

nome;

descrição;

professor;

turmas;

dias;

horários;

valor;

número de alunos;

vagas.

12. PÁGINA INDIVIDUAL DA MODALIDADE

Ao abrir uma modalidade, mostrar:

Futsal

Professor: Nome do professor

Dias: Segunda e quarta

Horário: 11h às 12h

Valor: R$ 40,00

Alunos: 15

Vagas: 5

Abaixo:

AlunoIdadeResponsávelTelefoneSituaçãoJoão10MariaWhatsApp🟢 AptoPedro9AnaWhatsApp🔴 Pendente

Permitir exportar essa lista para PDF.

13. PROFESSORES

Criar página:

Professores

Campos:

nome;

telefone;

e-mail;

modalidades;

turmas;

horários;

observações;

status ativo/inativo.

Um professor pode estar associado a várias turmas.

14. TURMAS

Criar página:

Turmas

Campos:

nome da turma;

modalidade;

professor;

dias;

horário inicial;

horário final;

valor;

capacidade;

alunos atuais;

vagas disponíveis;

status.

Calcular automaticamente:

Vagas disponíveis = capacidade - alunos ativos

Quando não houver vagas:

🔴 TURMA LOTADA

15. QUADRO GERAL DAS ESCOLINHAS

Criar página:

Quadro de Escolinhas

Essa página deve ser extremamente prática para consulta da secretaria.

Tabela:

ModalidadeDiasHorárioProfessorValorVagasBaléTer/Qui10h30–11h20ProfessorR$ 805FutsalSeg/Qua11h–12hProfessorR$ 408Natação—————Hidroginástica—————Vôlei—————

Tudo deve ser editável.

Permitir alterar:

modalidade;

dias;

horários;

professor;

valor;

capacidade;

observações.

Botão:

+ Nova turma

16. HORÁRIOS

Criar página:

Horários

Mostrar quadro semanal:

HorárioSegundaTerçaQuartaQuintaSexta09hFutsal—Futsal——10h—Balé—Balé—11hFutsal—Futsal——

Os dados devem vir das turmas cadastradas.

Não duplicar informações.

Se o horário da turma for alterado, atualizar automaticamente o quadro.

17. GERAÇÃO DE PDF

Criar botão:

Baixar horários em PDF

Gerar PDF profissional contendo:

COLÉGIO MANUELITO

ESCOLINHAS ESPORTIVAS

HORÁRIOS DAS ESCOLINHAS

Tabela:

modalidade;

dias;

horário;

professor;

valor.

Adicionar data de atualização.

Permitir:

PDF geral

PDF por modalidade

O PDF deve ser adequado para:

impressão;

entrega aos pais;

envio pelo WhatsApp.

18. RELATÓRIOS

Criar página:

Relatórios

Relatórios:

Alunos ativos

Alunos aptos

Alunos pendentes

Pagamentos do mês

Inadimplência

Alunos por modalidade

Alunos por professor

Novas matrículas

Permitir filtros e exportação.

19. COMUNICAÇÃO

Criar página:

Comunicação

Dividir em:

🔔 Próximos vencimentos

🔴 Mensalidades vencidas

🟢 Pagamentos recentes

Cada aluno deverá ter botão:

📱 Enviar WhatsApp

20. WHATSAPP — ENVIO MANUAL

IMPORTANTE:

Não implementar automação de WhatsApp nesta primeira versão.

Não utilizar API de WhatsApp.

Não utilizar bots.

Não realizar envio automático.

O sistema deverá somente:

gerar a mensagem;

preencher os dados automaticamente;

abrir o WhatsApp para que o funcionário revise e envie manualmente.

21. MENSAGEM DE MENSALIDADE PRÓXIMA DO VENCIMENTO

Criar mensagem editável nas configurações.

Mensagem inicial:

Olá, [NOME DO RESPONSÁVEL]! 😊

Passando para lembrar que a mensalidade da escolinha de [MODALIDADE], referente a [MÊS], tem vencimento em [DATA].

💙 Valor: [VALOR]

Para manter a participação do(a) aluno(a) nas atividades, pedimos que a mensalidade seja regularizada dentro do prazo.

Qualquer dúvida ou necessidade de informação, estamos à disposição.

Colégio Manuelito
Escolinhas Esportivas

O sistema deverá substituir automaticamente:

[NOME DO RESPONSÁVEL]

[NOME DO ALUNO]

[MODALIDADE]

[MÊS]

[DATA]

[VALOR]

22. MENSAGEM DE MENSALIDADE VENCIDA

Criar outra mensagem editável:

Olá, [NOME DO RESPONSÁVEL]!

Identificamos que a mensalidade da escolinha de [MODALIDADE], referente a [MÊS], ainda consta como pendente em nosso sistema.

Valor: [VALOR]

Vencimento: [DATA]

Lembramos que a participação nas atividades fica condicionada à regularização da mensalidade.

Caso o pagamento já tenha sido realizado, por favor, desconsidere esta mensagem ou entre em contato para conferirmos a situação.

Agradecemos a compreensão e a parceria.

Colégio Manuelito
Escolinhas Esportivas

23. MENSAGEM DE PAGAMENTO CONFIRMADO

Criar:

Olá, [NOME DO RESPONSÁVEL]! 😊

Confirmamos o recebimento da mensalidade da escolinha de [MODALIDADE], referente a [MÊS].

💙 Pagamento registrado com sucesso!

O(a) aluno(a) [NOME DO ALUNO] está com a mensalidade regularizada e apto(a) a participar das atividades.

Agradecemos pela parceria!

Colégio Manuelito

24. HISTÓRICO DE COMUNICAÇÃO

Quando o usuário clicar em "Enviar WhatsApp", registrar:

data;

horário;

usuário;

tipo de mensagem;

aluno;

responsável.

Exemplo:

23/09/2026 — 08:32

Lembrete de vencimento preparado/enviado pelo WhatsApp.

Usuário: Administrador.

IMPORTANTE:

O sistema deve registrar apenas que o usuário acionou o envio/abriu o WhatsApp.

Não considerar automaticamente que a mensagem foi entregue ou lida.

25. AVISO VISUAL DE MENSALIDADE

Criar opção:

🖼️ Gerar aviso visual

Gerar uma imagem adequada para WhatsApp.

Modelo:

COLÉGIO MANUELITO

LEMBRETE DE MENSALIDADE

Olá, [NOME DO RESPONSÁVEL]!

A mensalidade da escolinha de [MODALIDADE], referente a [MÊS], tem vencimento em:

[DATA]

Valor: [VALOR]

Agradecemos pela parceria e confiança no Colégio Manuelito.

Escolinhas Colégio Manuelito

Utilizar:

azul;

roxo;

amarelo;

branco.

Visual profissional e elegante.

Permitir salvar/baixar a imagem.

26. NOVAS MATRÍCULAS

Criar uma página independente:

📝 Novas Matrículas

Essa página será usada para registrar pessoas interessadas em ingressar nas escolinhas.

Não misturar inicialmente com os alunos já matriculados.

27. FORMULÁRIO DE NOVA MATRÍCULA

Organizar em etapas.

ETAPA 1 — ALUNO

Campos:

nome completo;

data de nascimento;

idade automática;

sexo;

escola/série, se necessário;

observações.

ETAPA 2 — RESPONSÁVEL

Campos:

nome;

parentesco;

CPF, se necessário;

telefone;

WhatsApp;

e-mail;

endereço.

ETAPA 3 — ESCOLINHA

Selecionar:

modalidade;

turma.

Ao selecionar a modalidade, mostrar automaticamente as turmas disponíveis.

Mostrar:

dias;

horário;

professor;

valor;

vagas disponíveis.

28. STATUS DA NOVA MATRÍCULA

Criar:

🟡 Interessado

🔵 Cadastro iniciado

🟠 Aguardando pagamento

🟢 Matrícula confirmada

🔴 Cancelado

⚫ Sem interesse

29. CONVERTER INTERESSADO EM ALUNO

Criar botão:

✅ Confirmar matrícula

Ao confirmar:

criar cadastro definitivo do aluno;

criar/vincular responsável;

vincular modalidade;

vincular turma;

criar mensalidade;

registrar data da matrícula;

mudar status para matrícula confirmada;

disponibilizar o aluno na área de Alunos.

Evitar duplicação.

Se o aluno ou responsável já existir, reutilizar o cadastro.

30. LISTA DE NOVAS MATRÍCULAS

Tabela:

AlunoResponsávelModalidadeTurmaDataStatusJoão SilvaMaria SilvaFutsalSeg/Qua23/09InteressadoAna SouzaCarlos SouzaBaléTer/Qui23/09Confirmada

Filtros:

período;

modalidade;

status;

turma.

Busca por nome.

31. ORIGEM DO INTERESSE

Campo:

Como conheceu as escolinhas?

Opções:

Instagram;

WhatsApp;

indicação;

aluno atual;

pais de alunos;

divulgação no colégio;

outro.

Permitir editar as opções.

32. AULA EXPERIMENTAL

Preparar campo para aula experimental:

solicitada;

agendada;

realizada;

não realizada.

Campos:

Data da aula experimental

Observação após aula experimental

33. DASHBOARD DE NOVAS MATRÍCULAS

Mostrar:

NOVAS MATRÍCULAS

Interessados: 8

Aguardando confirmação: 3

Confirmadas este mês: 5

Botão:

Ver novas matrículas

34. RELATÓRIO DE NOVAS MATRÍCULAS

Mostrar:

total de interessados;

matrículas confirmadas;

cancelamentos;

modalidades mais procuradas;

origem dos interessados;

conversão.

Permitir filtrar por período.

35. CHECK-IN / LIBERAÇÃO

Preparar uma tela futura chamada:

Controle de Entrada

O funcionário pesquisa o aluno.

Mostrar:

🟢 APTO — PODE PARTICIPAR

ou

🔴 NÃO APTO — PAGAMENTO PENDENTE

ou

⚪ SUSPENSO

ou

⚫ INATIVO

Essa funcionalidade deverá utilizar os mesmos dados financeiros e cadastrais do sistema.

Não criar banco de dados separado.

36. FREQUÊNCIA — PREPARAÇÃO FUTURA

Preparar arquitetura para futuramente controlar:

presença;

falta;

falta justificada;

histórico de frequência.

Futuramente o professor poderá acessar sua turma pelo celular e realizar a chamada.

Não é obrigatório implementar a chamada na primeira versão.

37. HISTÓRICO DE ALTERAÇÕES

Criar auditoria.

Registrar:

usuário;

data;

horário;

alteração realizada.

Exemplo:

23/09/2026

Administrador alterou o valor do Futsal de:

R$ 40,00 → R$ 45,00

38. CONFIGURAÇÕES

Criar página:

Configurações

Permitir alterar:

nome do colégio;

logo;

cores;

telefone;

e-mail;

modalidades;

valores;

dias;

horários;

professores;

formas de pagamento;

mensagens de WhatsApp;

usuários;

permissões;

configurações de mensalidade;

quantidade de dias antes do vencimento para aparecer como "próximo vencimento".

39. BANCO DE DADOS

Utilizar preferencialmente Supabase.

Criar estrutura relacional.

Tabelas sugeridas:

users

students

guardians

modalities

teachers

classes

enrollments

monthly_payments

payment_methods

communication_logs

experimental_classes

audit_logs

settings

Criar relacionamentos adequados.

Não duplicar dados desnecessariamente.

40. SEGURANÇA

Implementar:

autenticação Google;

permissões;

Row Level Security;

proteção de dados;

validação dos formulários;

confirmação antes de excluir;

histórico de alterações;

tratamento de erros.

Informações de crianças e responsáveis devem permanecer privadas.

41. ARQUIVAMENTO

Não apagar alunos definitivamente sem confirmação.

Preferir:

Ativo / Inativo / Arquivado

Manter histórico dos alunos que deixaram a escolinha.

O histórico financeiro nunca deve ser apagado automaticamente.

42. ALTERAÇÃO DE MODALIDADE

Permitir mudar um aluno de modalidade sem perder histórico.

Exemplo:

Março–Julho:

Futsal

Agosto em diante:

Vôlei

O sistema deve preservar o histórico anterior.

43. FILTROS

Adicionar filtros em todas as páginas relevantes.

Filtros:

modalidade;

turma;

professor;

situação financeira;

status da matrícula;

faixa etária;

mês;

dia da semana;

período.

Permitir combinar filtros.

Exemplo:

Futsal + Pendentes + Setembro

44. INDICADORES FINANCEIROS

Dashboard:

Mensalidades previstas

Mensalidades pagas

Mensalidades pendentes

Valor recebido

Valor pendente

Calcular automaticamente.

45. IMPORTAÇÃO DE ALUNOS

Preparar estrutura para futuramente importar Excel/CSV.

Campos:

nome;

nascimento;

responsável;

telefone;

modalidade;

turma;

valor.

Antes de salvar:

mostrar prévia dos dados.

46. EXPORTAÇÃO

Permitir exportar informações para:

PDF;

CSV/Excel.

Respeitar os filtros aplicados.

Exemplo:

Se o usuário selecionar:

Futsal + Pendentes

e exportar:

o arquivo deve conter somente esses alunos.

47. MENU LATERAL

Menu:

🏠 Dashboard

👨‍🎓 Alunos

📝 Novas Matrículas

⚽ Modalidades

👨‍🏫 Professores

📅 Turmas

🕐 Horários

💰 Financeiro

📱 Comunicação

📊 Relatórios

📄 PDFs

⚙️ Configurações

48. PESQUISA GLOBAL

Criar campo no topo:

🔎 Pesquisar aluno, responsável, modalidade ou professor

Pesquisar simultaneamente:

alunos;

responsáveis;

modalidades;

professores;

turmas.

49. RESPONSIVIDADE

O sistema deve funcionar corretamente em:

computador;

notebook;

tablet;

celular.

No celular:

adaptar tabelas;

permitir rolagem horizontal quando necessário;

transformar tabelas em cards quando apropriado;

manter botões acessíveis.

50. EXPERIÊNCIA DO USUÁRIO

Priorizar simplicidade.

Principais botões:

+ Novo aluno

+ Nova matrícula

+ Novo pagamento

+ Nova turma

+ Nova modalidade

📱 Enviar WhatsApp

📄 Baixar PDF

🔴 Ver pendências

Utilizar mensagens claras.

Exemplo:

✅ Pagamento registrado com sucesso.

Aluno liberado para frequentar as atividades.

51. DADOS INICIAIS

Cadastrar inicialmente:

Balé

Futsal

Natação

Hidroginástica

Vôlei

Os dados de:

professores;

horários;

dias;

valores;

capacidade;

devem ser editáveis.

Não fixar esses dados no código.

52. VALORES

Nunca deixar valores fixos no código.

O administrador deverá conseguir alterar o valor pela interface.

Exemplo inicial:

Futsal — R$ 40,00

Balé — R$ 80,00

Esses valores são apenas exemplos e devem ser facilmente editáveis.

53. FLUXO PRINCIPAL DO SISTEMA

O sistema deverá funcionar assim:

NOVO INTERESSADO

↓

Cadastro em Novas Matrículas

↓

Escolha da modalidade

↓

Escolha da turma

↓

Cadastro do responsável

↓

Acompanhamento do interesse

↓

Confirmar matrícula

↓

Criação do aluno

↓

Criação da mensalidade

↓

Registro do pagamento

↓

🟢 APTO A FREQUENTAR

↓

Mensalidade se aproxima do vencimento

↓

Sistema mostra em:

Comunicação → Próximos vencimentos

↓

Funcionário clica:

📱 Enviar WhatsApp

↓

WhatsApp abre com mensagem preenchida

↓

Funcionário revisa e envia manualmente

↓

Pagamento realizado

↓

Funcionário registra pagamento

↓

🟢 Aluno permanece apto

Caso não seja pago:

↓

🔴 NÃO APTO — PAGAMENTO PENDENTE

↓

Pagamento é regularizado

↓

🟢 APTO A FREQUENTAR

54. REGRA IMPORTANTE SOBRE WHATSAPP

Não criar nenhuma automação de WhatsApp nesta primeira versão.

Não criar:

API;

bot;

envio automático;

mensagens programadas;

integração oficial;

integração não oficial.

Apenas:

Gerar mensagem → Abrir WhatsApp → Funcionário revisa → Funcionário envia.

Também disponibilizar:

Copiar mensagem

para permitir que o funcionário utilize a mensagem em outro aplicativo ou canal.

55. GERAÇÃO DE ARTES

A função de aviso visual deverá permitir gerar uma imagem personalizada para cada mensalidade.

Usar:

nome do responsável;

nome do aluno;

modalidade;

mês;

vencimento;

valor.

A imagem deve seguir a identidade do Colégio Manuelito.

56. TESTES OBRIGATÓRIOS

Antes de considerar o sistema pronto, testar:

Login Google.

Logout.

Criar aluno.

Editar aluno.

Criar responsável.

Criar modalidade.

Criar professor.

Criar turma.

Vincular aluno à turma.

Registrar mensalidade.

Registrar pagamento.

Confirmar mudança automática para APTO.

Criar mensalidade pendente.

Confirmar mudança automática para NÃO APTO.

Regularizar pagamento.

Confirmar retorno para APTO.

Criar nova matrícula.

Converter nova matrícula em aluno.

Verificar cálculo de idade.

Verificar cálculo de vagas.

Alterar horário.

Confirmar atualização automática do quadro de horários.

Gerar PDF.

Gerar PDF por modalidade.

Gerar aviso visual.

Abrir WhatsApp com mensagem preenchida.

Copiar mensagem.

Registrar histórico de comunicação.

Testar filtros.

Testar pesquisa.

Testar permissões.

Testar versão mobile.

Testar arquivamento.

Confirmar que histórico financeiro não seja perdido.

57. PRINCÍPIO FUNDAMENTAL DO PROJETO

Não criar apenas uma interface bonita ou um protótipo.

Criar uma aplicação realmente funcional, com dados persistentes no banco de dados.

Todas as telas precisam estar conectadas.

Todos os cadastros precisam funcionar.

Todas as alterações precisam ser persistidas.

O sistema deve ser simples o suficiente para ser utilizado diariamente pela secretaria do Colégio Manuelito.

58. RESULTADO FINAL ESPERADO

Ao final, o Colégio Manuelito deverá conseguir utilizar o sistema para:

Cadastrar interessados

↓

Transformar interessados em alunos

↓

Organizar modalidades e turmas

↓

Controlar professores e horários

↓

Controlar mensalidades

↓

Saber quem pode ou não frequentar

↓

Enviar lembretes manualmente pelo WhatsApp

↓

Registrar pagamentos

↓

Liberar automaticamente o aluno após a regularização

↓

Gerar horários e relatórios em PDF

↓

Consultar toda a história do aluno em um único lugar.

A aplicação deve ser escalável e preparada para receber futuramente novas funcionalidades, mas a primeira versão deve priorizar simplicidade, estabilidade, segurança e funcionamento real.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://escolinhas-manuelito.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/267419a8-4d73-44a0-bf3b-c1f17776b093).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
