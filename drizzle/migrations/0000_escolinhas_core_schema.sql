-- ROLES
create type public.app_role as enum ('admin','colaborador');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "auth read profiles" on public.profiles for select to authenticated using (true);
create policy "own profile update" on public.profiles for update to authenticated using (auth.uid() = id);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "auth read roles" on public.user_roles for select to authenticated using (true);
create policy "admin manage roles" on public.user_roles for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- first user becomes admin, others colaborador
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', new.email), new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, case when (select count(*) from public.user_roles) = 0 then 'admin'::public.app_role else 'colaborador'::public.app_role end)
  on conflict do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- helper: updated_at
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

-- TEACHERS
create table public.teachers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- MODALITIES
create table public.modalities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  default_price numeric(10,2) not null default 0,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- CLASSES (turmas)
create table public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  modality_id uuid not null references public.modalities(id) on delete restrict,
  teacher_id uuid references public.teachers(id) on delete set null,
  days text[] not null default '{}',
  start_time time,
  end_time time,
  price numeric(10,2) not null default 0,
  capacity integer not null default 20,
  notes text,
  status text not null default 'ativa',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- GUARDIANS
create table public.guardians (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  relationship text,
  cpf text,
  phone text,
  whatsapp text,
  email text,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- STUDENTS
create table public.students (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  birth_date date,
  gender text,
  guardian_id uuid references public.guardians(id) on delete set null,
  school_grade text,
  notes text,
  enrollment_date date not null default current_date,
  status text not null default 'ativo', -- ativo | suspenso | inativo | arquivado
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ENROLLMENTS (histórico de modalidade/turma)
create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  modality_id uuid not null references public.modalities(id) on delete restrict,
  class_id uuid references public.classes(id) on delete set null,
  monthly_fee numeric(10,2) not null default 0,
  start_date date not null default current_date,
  end_date date,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- PAYMENT METHODS
create table public.payment_methods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  active boolean not null default true
);

-- MONTHLY PAYMENTS
create table public.monthly_payments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  enrollment_id uuid references public.enrollments(id) on delete set null,
  reference_month date not null,
  amount numeric(10,2) not null default 0,
  due_date date not null,
  paid_at date,
  payment_method_id uuid references public.payment_methods(id) on delete set null,
  notes text,
  recorded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.monthly_payments (student_id);
create index on public.monthly_payments (due_date);

-- LEADS (novas matrículas)
create table public.lead_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  active boolean not null default true
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  student_name text not null,
  birth_date date,
  gender text,
  school_grade text,
  student_notes text,
  guardian_name text,
  guardian_relationship text,
  guardian_cpf text,
  guardian_phone text,
  guardian_whatsapp text,
  guardian_email text,
  guardian_address text,
  modality_id uuid references public.modalities(id) on delete set null,
  class_id uuid references public.classes(id) on delete set null,
  source text,
  status text not null default 'interessado', -- interessado | iniciado | aguardando_pagamento | confirmada | cancelado | sem_interesse
  trial_status text, -- solicitada | agendada | realizada | nao_realizada
  trial_date date,
  trial_notes text,
  converted_student_id uuid references public.students(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- COMMUNICATION LOGS
create table public.communication_logs (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.students(id) on delete set null,
  guardian_id uuid references public.guardians(id) on delete set null,
  payment_id uuid references public.monthly_payments(id) on delete set null,
  type text not null,
  channel text not null default 'whatsapp',
  message text,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- AUDIT LOGS
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  entity text not null,
  entity_id uuid,
  action text not null,
  description text,
  created_at timestamptz not null default now()
);

-- ATTENDANCE (futuro)
create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  class_id uuid references public.classes(id) on delete set null,
  date date not null default current_date,
  status text not null default 'presente',
  notes text,
  created_at timestamptz not null default now(),
  unique (student_id, class_id, date)
);

-- SETTINGS
create table public.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- grants + RLS for all app tables
do $$
declare t text;
begin
  foreach t in array array['teachers','modalities','classes','guardians','students','enrollments','payment_methods','monthly_payments','lead_sources','leads','communication_logs','audit_logs','attendance','settings']
  loop
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('grant all on public.%I to service_role', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "auth read %1$s" on public.%1$I for select to authenticated using (true)', t);
    execute format('create policy "auth write %1$s" on public.%1$I for insert to authenticated with check (true)', t);
    execute format('create policy "auth update %1$s" on public.%1$I for update to authenticated using (true)', t);
    execute format('create policy "admin delete %1$s" on public.%1$I for delete to authenticated using (public.has_role(auth.uid(),''admin''))', t);
    execute format('create trigger touch_%1$s before update on public.%1$I for each row execute function public.touch_updated_at()', t);
  end loop;
end $$;

-- view: alunos com situação calculada
create or replace view public.students_status
with (security_invoker = true) as
select
  s.id,
  s.name,
  s.birth_date,
  s.gender,
  s.guardian_id,
  s.school_grade,
  s.notes,
  s.enrollment_date,
  s.status as enrollment_status,
  s.created_at,
  g.name as guardian_name,
  g.phone as guardian_phone,
  g.whatsapp as guardian_whatsapp,
  g.email as guardian_email,
  g.relationship as guardian_relationship,
  e.id as enrollment_id,
  e.modality_id,
  m.name as modality_name,
  e.class_id,
  c.name as class_name,
  c.days as class_days,
  c.start_time,
  c.end_time,
  c.teacher_id,
  t.name as teacher_name,
  e.monthly_fee,
  case
    when s.status in ('inativo','arquivado') then 'inativo'
    when s.status = 'suspenso' then 'suspenso'
    when exists (select 1 from public.monthly_payments p where p.student_id = s.id and p.paid_at is null and p.due_date < current_date) then 'nao_apto'
    when exists (select 1 from public.monthly_payments p where p.student_id = s.id and p.paid_at is null and p.due_date >= current_date) then 'a_vencer'
    else 'apto'
  end as aptitude,
  date_part('year', age(coalesce(s.birth_date, current_date)))::int as age
from public.students s
left join public.guardians g on g.id = s.guardian_id
left join public.enrollments e on e.student_id = s.id and e.active = true
left join public.modalities m on m.id = e.modality_id
left join public.classes c on c.id = e.class_id
left join public.teachers t on t.id = c.teacher_id;

grant select on public.students_status to authenticated;

-- view: turmas com ocupação
create or replace view public.classes_overview
with (security_invoker = true) as
select c.*, m.name as modality_name, t.name as teacher_name,
  (select count(*) from public.enrollments e join public.students s on s.id = e.student_id
     where e.class_id = c.id and e.active = true and s.status = 'ativo') as active_students,
  c.capacity - (select count(*) from public.enrollments e join public.students s on s.id = e.student_id
     where e.class_id = c.id and e.active = true and s.status = 'ativo') as available_spots
from public.classes c
left join public.modalities m on m.id = c.modality_id
left join public.teachers t on t.id = c.teacher_id;

grant select on public.classes_overview to authenticated;

-- dados iniciais
insert into public.modalities (name, description, default_price) values
  ('Balé','Escolinha de balé', 80.00),
  ('Futsal','Escolinha de futsal', 40.00),
  ('Natação','Escolinha de natação', 0),
  ('Hidroginástica','Hidroginástica', 0),
  ('Vôlei','Escolinha de vôlei', 0);

insert into public.payment_methods (name) values ('Pix'),('Dinheiro'),('Cartão'),('Transferência'),('Outro');

insert into public.lead_sources (name) values ('Instagram'),('WhatsApp'),('Indicação'),('Aluno atual'),('Pais de alunos'),('Divulgação no colégio'),('Outro');

insert into public.settings (key, value) values
  ('school', '{"name":"Colégio Manuelito","phone":"","email":"","logo_url":""}'::jsonb),
  ('finance', '{"due_soon_days":7,"default_due_day":10}'::jsonb),
  ('messages', '{"due_soon":"Olá, [NOME DO RESPONSÁVEL]! 😊\n\nPassando para lembrar que a mensalidade da escolinha de [MODALIDADE], referente a [MÊS], tem vencimento em [DATA].\n\n💙 Valor: [VALOR]\n\nPara manter a participação do(a) aluno(a) [NOME DO ALUNO] nas atividades, pedimos que a mensalidade seja regularizada dentro do prazo.\n\nQualquer dúvida ou necessidade de informação, estamos à disposição.\n\nColégio Manuelito\nEscolinhas Esportivas","overdue":"Olá, [NOME DO RESPONSÁVEL]!\n\nIdentificamos que a mensalidade da escolinha de [MODALIDADE], referente a [MÊS], ainda consta como pendente em nosso sistema.\n\nValor: [VALOR]\nVencimento: [DATA]\n\nLembramos que a participação nas atividades fica condicionada à regularização da mensalidade.\n\nCaso o pagamento já tenha sido realizado, por favor, desconsidere esta mensagem ou entre em contato para conferirmos a situação.\n\nAgradecemos a compreensão e a parceria.\n\nColégio Manuelito\nEscolinhas Esportivas","paid":"Olá, [NOME DO RESPONSÁVEL]! 😊\n\nConfirmamos o recebimento da mensalidade da escolinha de [MODALIDADE], referente a [MÊS].\n\n💙 Pagamento registrado com sucesso!\n\nO(a) aluno(a) [NOME DO ALUNO] está com a mensalidade regularizada e apto(a) a participar das atividades.\n\nAgradecemos pela parceria!\n\nColégio Manuelito"}'::jsonb);
