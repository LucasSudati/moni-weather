-- MONI Weather — relatos da comunidade. Cole no SQL Editor do Supabase e execute (Run).
-- ANTES: troque 'troque-este-sal' por um texto seu (aparece 2x). Serve para não guardar o IP em claro.

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  k text not null check (k in ('shelter','collect','distrib','tarp_have','tarp_need','tree','wire','power_on','power_off','water_on','water_off')),
  lat double precision not null check (lat between -90 and 90),
  lon double precision not null check (lon between -180 and 180),
  note text check (char_length(note) <= 140),
  ok int not null default 0,
  gone int not null default 0,
  ts timestamptz not null default now(),
  ip_hash text
);
create index if not exists reports_ts_idx on public.reports (ts desc);
create index if not exists reports_geo_idx on public.reports (lat, lon);

create table if not exists public.report_votes (
  report_id uuid references public.reports(id) on delete cascade,
  ip_hash text,
  v text,
  primary key (report_id, ip_hash)
);

alter table public.reports enable row level security;
alter table public.report_votes enable row level security;  -- sem policies: inacessível pela API

-- Permissões mínimas: o público lê e cria; não edita, não apaga, não forja contadores/data.
revoke all on public.reports from anon, authenticated;
revoke all on public.report_votes from anon, authenticated;
grant select (id,k,lat,lon,note,ok,gone,ts) on public.reports to anon;
grant insert (k,lat,lon,note) on public.reports to anon;
drop policy if exists reports_select on public.reports;
drop policy if exists reports_insert on public.reports;
create policy reports_select on public.reports for select to anon using (true);
create policy reports_insert on public.reports for insert to anon with check (true);

-- Limite de envio por IP (10 relatos / 10 min). Sem cabeçalho de IP, não limita.
create or replace function public.reports_guard() returns trigger language plpgsql security definer set search_path = public as $$
declare ip text := split_part(coalesce(current_setting('request.headers', true)::json->>'x-forwarded-for',''), ',', 1);
        h text;
begin
  if ip <> '' then
    h := md5(ip || 'teste');
    new.ip_hash := h;
    if (select count(*) from public.reports where ip_hash = h and ts > now() - interval '10 minutes') >= 10 then
      raise exception 'limite de relatos atingido';
    end if;
  end if;
  return new;
end $$;
drop trigger if exists reports_guard on public.reports;
create trigger reports_guard before insert on public.reports for each row execute function public.reports_guard();

-- Voto "ainda vale / não está mais": 1 voto por IP por relato.
create or replace function public.vote_report(rid uuid, v text) returns void language plpgsql security definer set search_path = public as $$
declare ip text := split_part(coalesce(current_setting('request.headers', true)::json->>'x-forwarded-for',''), ',', 1);
        h text := coalesce(nullif(md5(split_part(coalesce(current_setting('request.headers', true)::json->>'x-forwarded-for',''), ',', 1) || 'teste'), md5('teste')), gen_random_uuid()::text);
begin
  if v not in ('ok','gone') then raise exception 'voto invalido'; end if;
  insert into public.report_votes(report_id, ip_hash, v) values (rid, h, v) on conflict do nothing;
  if found then
    if v = 'ok' then update public.reports set ok = ok + 1 where id = rid;
    else update public.reports set gone = gone + 1 where id = rid; end if;
  end if;
end $$;
revoke all on function public.vote_report(uuid, text) from public;
grant execute on function public.vote_report(uuid, text) to anon;
