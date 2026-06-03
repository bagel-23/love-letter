create table if not exists public.letters (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  deleted boolean not null default false,
  deleted_at timestamptz,

  poem text not null,
  preview_line text,
  date_label text,
  season text,
  source text,

  payload jsonb not null
);

create index if not exists letters_created_at_idx on public.letters (created_at desc);
create index if not exists letters_deleted_idx on public.letters (deleted);
create index if not exists letters_payload_gin_idx on public.letters using gin (payload);

-- For public archive reading later, use a view instead of exposing service role keys.
create or replace view public.public_letters as
select
  id,
  created_at,
  poem,
  preview_line,
  date_label,
  season,
  source,
  payload
from public.letters
where deleted = false
order by created_at desc;
