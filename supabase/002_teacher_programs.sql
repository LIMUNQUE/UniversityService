alter table public.programs
  add column if not exists teacher_id uuid references public.profiles(id) on delete set null;

drop policy if exists "Authenticated users can create programs" on public.programs;
drop policy if exists "Teachers can update own programs" on public.programs;
drop policy if exists "Enrollments are readable by owner" on public.enrollments;
drop policy if exists "Teachers can read enrolled student profiles" on public.profiles;

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
