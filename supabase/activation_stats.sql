-- Jalankan sekali di Supabase > SQL Editor.
-- Tabel statistik aktivasi untuk website Cupz Project.
create table if not exists public.activation_stats (
  id integer primary key default 1 check (id = 1),
  total_activations bigint not null default 0,
  today_activations bigint not null default 0,
  stat_date date not null default (timezone('Asia/Jakarta', now())::date),
  updated_at timestamptz not null default now()
);

insert into public.activation_stats (id)
values (1)
on conflict (id) do nothing;

-- Atomic increment: aman saat beberapa user klik Kirim Link bersamaan.
create or replace function public.increment_activation_stats()
returns table(total bigint, today bigint)
language plpgsql
security definer
set search_path = public
as $$
declare
  today_wib date := timezone('Asia/Jakarta', now())::date;
begin
  insert into public.activation_stats (id, total_activations, today_activations, stat_date)
  values (1, 0, 0, today_wib)
  on conflict (id) do nothing;

  if (select stat_date from public.activation_stats where id = 1) <> today_wib then
    update public.activation_stats
      set total_activations = total_activations + 1,
          today_activations = 1,
          stat_date = today_wib,
          updated_at = now()
    where id = 1;
  else
    update public.activation_stats
      set total_activations = total_activations + 1,
          today_activations = today_activations + 1,
          updated_at = now()
    where id = 1;
  end if;

  return query
    select total_activations, today_activations
    from public.activation_stats
    where id = 1;
end;
$$;

-- Fungsi dipanggil dari server menggunakan service-role key.
revoke all on function public.increment_activation_stats() from public;
grant execute on function public.increment_activation_stats() to service_role;
