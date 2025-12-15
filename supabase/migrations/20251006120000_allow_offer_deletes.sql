-- Allow participants to delete offer messages and offers

-- Messages: allow coach or customer in the conversation to delete OFFER-type messages
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where policyname = 'Participants can delete offer messages' 
      and schemaname = 'public' 
      and tablename = 'messages'
  ) then
    create policy "Participants can delete offer messages"
    on public.messages
    for delete
    using (
      message_type = 'offer' and
      exists (
        select 1 from public.conversations c
        where c.id = messages.conversation_id
          and (c.coach_id = auth.uid() or c.customer_id = auth.uid())
      )
    );
  end if;
end $$;

-- Coach offers: allow coach or customer to delete the offer row
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where policyname = 'Participants can delete offers' 
      and schemaname = 'public' 
      and tablename = 'coach_offers'
  ) then
    create policy "Participants can delete offers"
    on public.coach_offers
    for delete
    using (auth.uid() = coach_id or auth.uid() = customer_id);
  end if;
end $$;


