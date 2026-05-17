create type public.user_role as enum ('student', 'teacher', 'admin');
create type public.payment_status as enum ('pending', 'paid', 'failed', 'refunded');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'student',
  full_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.programs (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  modality text,
  teacher_id uuid references public.profiles(id) on delete set null,
  starts_on date,
  created_at timestamptz not null default now()
);

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  program_id uuid not null references public.programs(id) on delete cascade,
  moodle_course_id text,
  created_at timestamptz not null default now(),
  unique (profile_id, program_id)
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null default 'payphone',
  external_id text,
  amount_cents integer not null,
  currency text not null default 'USD',
  status public.payment_status not null default 'pending',
  receipt_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.programs enable row level security;
alter table public.enrollments enable row level security;
alter table public.payments enable row level security;

create policy "Profiles are readable by owner"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Teachers can read enrolled student profiles"
  on public.profiles for select
  using (
    auth.uid() = id
    or exists (
      select 1
      from public.enrollments
      join public.programs on programs.id = enrollments.program_id
      where enrollments.profile_id = profiles.id
        and programs.teacher_id = auth.uid()
    )
  );

create policy "Profiles are editable by owner"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Programs are public"
  on public.programs for select
  using (true);

create policy "Authenticated users can create programs"
  on public.programs for insert
  with check (
    auth.role() = 'authenticated'
    and teacher_id = auth.uid()
    and exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('teacher', 'admin')
    )
  );

create policy "Teachers can update own programs"
  on public.programs for update
  using (
    teacher_id = auth.uid()
    and exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('teacher', 'admin')
    )
  )
  with check (teacher_id = auth.uid());

create policy "Enrollments are readable by owner"
  on public.enrollments for select
  using (
    auth.uid() = profile_id
    or exists (
      select 1
      from public.programs
      where programs.id = enrollments.program_id
        and programs.teacher_id = auth.uid()
    )
  );

create policy "Students can create own enrollments"
  on public.enrollments for insert
  with check (auth.uid() = profile_id);

create policy "Students can delete own enrollments"
  on public.enrollments for delete
  using (auth.uid() = profile_id);

create policy "Payments are readable by owner"
  on public.payments for select
  using (auth.uid() = profile_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    case
      when new.raw_user_meta_data ->> 'role' in ('student', 'teacher', 'admin')
        then (new.raw_user_meta_data ->> 'role')::public.user_role
      else 'student'::public.user_role
    end
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    role = excluded.role,
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

insert into public.programs (code, title, modality, starts_on)
values
  ('PROG-001', 'Programa placeholder de posgrado', 'Hibrido', '2026-06-01'),
  ('CUR-002', 'Curso placeholder de educacion continua', 'En linea', '2026-07-15'),
  ('DIP-003', 'Diplomado placeholder institucional', 'Presencial', '2026-08-20')
on conflict (code) do update set
  title = excluded.title,
  modality = excluded.modality,
  starts_on = excluded.starts_on;

alter table public.programs
  add column if not exists teacher_id uuid references public.profiles(id) on delete set null;
