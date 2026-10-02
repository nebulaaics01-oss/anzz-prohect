create extension if not exists pgcrypto;
create table if not exists public.profiles(id uuid primary key references auth.users(id) on delete cascade,email text,display_name text,role text not null default 'user' check(role in('user','admin')),credits integer not null default 5 check(credits>=0),daily_credits integer not null default 5 check(daily_credits>=0),credit_reset_at timestamptz not null default now(),created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$ begin insert into public.profiles(id,email,display_name) values(new.id,new.email,coalesce(new.raw_user_meta_data->>'full_name','')) on conflict(id) do update set email=excluded.email; return new; end; $$;
drop trigger if exists on_auth_user_created on auth.users; create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
create or replace function public.ensure_daily_credit_reset() returns void language plpgsql security definer set search_path=public as $$ declare now_wib timestamptz:=timezone('Asia/Jakarta',now()); begin update public.profiles set credits=daily_credits,credit_reset_at=now(),updated_at=now() where timezone('Asia/Jakarta',credit_reset_at)::date < now_wib::date; end; $$;
create or replace function public.consume_credit(p_user_id uuid,p_amount integer default 1) returns jsonb language plpgsql security definer set search_path=public as $$ declare p public.profiles; begin if p_amount<=0 then raise exception 'Jumlah kredit tidak valid'; end if; perform public.ensure_daily_credit_reset(); update public.profiles set credits=credits-p_amount,updated_at=now() where id=p_user_id and credits>=p_amount returning * into p; if not found then raise exception 'Kredit tidak cukup'; end if; return jsonb_build_object('credits',p.credits,'daily_credits',p.daily_credits,'reset_at',p.credit_reset_at); end; $$;
create or replace function public.admin_adjust_credit(p_admin_id uuid,p_user_id uuid,p_amount integer) returns jsonb language plpgsql security definer set search_path=public as $$ declare a public.profiles;p public.profiles;begin select * into a from public.profiles where id=p_admin_id;if a.role<>'admin' then raise exception 'Akses admin diperlukan';end if;perform public.ensure_daily_credit_reset();update public.profiles set credits=greatest(0,credits+p_amount),updated_at=now() where id=p_user_id returning * into p;if not found then raise exception 'User tidak ditemukan';end if;return jsonb_build_object('id',p.id,'email',p.email,'credits',p.credits,'daily_credits',p.daily_credits,'role',p.role);end; $$;
alter table public.profiles enable row level security; drop policy if exists "users read own profile" on public.profiles; create policy "users read own profile" on public.profiles for select using(auth.uid()=id); revoke all on public.profiles from anon,authenticated; grant select on public.profiles to authenticated;
revoke all on function public.ensure_daily_credit_reset() from public;revoke all on function public.consume_credit(uuid,integer) from public;revoke all on function public.admin_adjust_credit(uuid,uuid,integer) from public;grant execute on function public.ensure_daily_credit_reset() to service_role;grant execute on function public.consume_credit(uuid,integer) to service_role;grant execute on function public.admin_adjust_credit(uuid,uuid,integer) to service_role;
-- Setelah membuat akun admin: update public.profiles set role='admin',daily_credits=100,credits=100 where email='EMAIL_ADMIN';


-- Pengaturan website: maintenance & broadcast
create table if not exists public.site_settings (
  id integer primary key check (id = 1),
  maintenance boolean not null default false,
  maintenance_message text not null default 'Website sedang dalam pemeliharaan. Silakan kembali beberapa saat lagi.',
  broadcast_active boolean not null default false,
  broadcast_id text,
  broadcast_title text not null default 'Informasi',
  broadcast_message text not null default '',
  updated_at timestamptz not null default now()
);
insert into public.site_settings(id) values(1) on conflict(id) do nothing;
revoke all on public.site_settings from public, anon, authenticated;
grant select on public.site_settings to service_role;
