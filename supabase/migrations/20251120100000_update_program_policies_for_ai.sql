set search_path = public;

drop policy if exists "Coaches can create their own programs" on public.programs;

create policy "Coaches can create their own programs"
on public.programs
for insert
with check (
  (
    auth.uid() = coach_id
    and (
      assigned_to is null
      or public.is_coach_customer_relationship(coach_id, assigned_to)
    )
  )
  or (
    is_ai_generated = true
    and auth.uid() = coach_id
    and auth.uid() = assigned_to
  )
);


