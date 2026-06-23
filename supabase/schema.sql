create extension if not exists "pgcrypto";

create table if not exists public.world_cups (
  id uuid primary key default gen_random_uuid(),
  year int not null unique,
  host_country text not null
);

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  image_url text not null,
  world_cup_id uuid not null references public.world_cups(id) on delete cascade,
  votes_count int not null default 0 check (votes_count >= 0),
  created_at timestamptz not null default now(),
  unique (name),
  unique (world_cup_id, name)
);

create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  world_cup_id uuid not null references public.world_cups(id) on delete cascade,
  session_id text not null,
  created_at timestamptz not null default now(),
  unique (world_cup_id, session_id)
);

alter table public.world_cups enable row level security;
alter table public.players enable row level security;
alter table public.votes enable row level security;

drop policy if exists "world cups are public" on public.world_cups;
create policy "world cups are public"
on public.world_cups for select
to anon, authenticated
using (true);

drop policy if exists "players are public" on public.players;
create policy "players are public"
on public.players for select
to anon, authenticated
using (true);

drop policy if exists "votes are private" on public.votes;
create policy "votes are private"
on public.votes for select
to authenticated
using (false);

create or replace function public.cast_vote(
  p_player_id uuid,
  p_world_cup_id uuid,
  p_session_id text
)
returns table (
  id uuid,
  name text,
  image_url text,
  world_cup_id uuid,
  votes_count int,
  world_cups jsonb
)
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_player public.players%rowtype;
  selected_cup public.world_cups%rowtype;
begin
  select * into selected_player
  from public.players
  where players.id = p_player_id
    and players.world_cup_id = p_world_cup_id;

  if selected_player.id is null then
    raise exception 'invalid_player';
  end if;

  if exists (
    select 1
    from public.votes
    where votes.world_cup_id = p_world_cup_id
      and votes.session_id = p_session_id
  ) then
    raise exception 'already_voted';
  end if;

  insert into public.votes (player_id, world_cup_id, session_id)
  values (p_player_id, p_world_cup_id, p_session_id);

  update public.players
  set votes_count = public.players.votes_count + 1
  where public.players.id = p_player_id
  returning * into selected_player;

  select * into selected_cup
  from public.world_cups
  where world_cups.id = p_world_cup_id;

  return query
  select
    selected_player.id,
    selected_player.name,
    selected_player.image_url,
    selected_player.world_cup_id,
    selected_player.votes_count,
    jsonb_build_object(
      'id', selected_cup.id,
      'year', selected_cup.year,
      'host_country', selected_cup.host_country
    ) as world_cups;
end;
$$;

grant execute on function public.cast_vote(uuid, uuid, text) to anon, authenticated;

with cups(year, host_country) as (
  values
    (1930, 'Uruguai'),
    (1934, 'Italia'),
    (1938, 'Franca'),
    (1950, 'Brasil'),
    (1954, 'Suica'),
    (1958, 'Suecia'),
    (1962, 'Chile'),
    (1966, 'Inglaterra'),
    (1970, 'Mexico'),
    (1974, 'Alemanha Ocidental'),
    (1978, 'Argentina'),
    (1982, 'Espanha'),
    (1986, 'Mexico'),
    (1990, 'Italia'),
    (1994, 'Estados Unidos'),
    (1998, 'Franca'),
    (2002, 'Coreia do Sul e Japao'),
    (2006, 'Alemanha'),
    (2010, 'Africa do Sul'),
    (2014, 'Brasil'),
    (2018, 'Russia'),
    (2022, 'Catar'),
    (2026, 'Canada, Mexico e EUA')
)
insert into public.world_cups (year, host_country)
select year, host_country
from cups
on conflict (year) do update set host_country = excluded.host_country;

with player_seed(year, name, seed, votes_count) as (
  values
    (1930, 'Preguinho', 'preguinho', 0),
    (1930, 'Fausto', 'fausto', 0),
    (1934, 'Leonidas', 'leonidas', 0),
    (1934, 'Waldemar de Brito', 'waldemar-de-brito', 0),
    (1938, 'Domingos da Guia', 'domingos-da-guia', 0),
    (1938, 'Romeu Pellicciari', 'romeu-pellicciari', 0),
    (1950, 'Zizinho', 'zizinho', 0),
    (1950, 'Ademir de Menezes', 'ademir-de-menezes', 0),
    (1954, 'Didi', 'didi', 0),
    (1954, 'Julinho Botelho', 'julinho-botelho', 0),
    (1958, 'Garrincha', 'garrincha', 0),
    (1958, 'Nilton Santos', 'nilton-santos', 0),
    (1962, 'Vava', 'vava', 0),
    (1962, 'Amarildo', 'amarildo', 0),
    (1966, 'Tostao', 'tostao', 0),
    (1966, 'Jairzinho', 'jairzinho', 0),
    (1970, 'Pele', 'pele', 0),
    (1970, 'Carlos Alberto Torres', 'carlos-alberto-torres', 0),
    (1974, 'Rivelino', 'rivelino', 0),
    (1974, 'Leao', 'leao', 0),
    (1978, 'Roberto Dinamite', 'roberto-dinamite', 0),
    (1978, 'Dirceu', 'dirceu', 0),
    (1982, 'Zico', 'zico', 0),
    (1982, 'Socrates', 'socrates', 0),
    (1986, 'Careca', 'careca', 0),
    (1986, 'Junior', 'junior', 0),
    (1990, 'Dunga', 'dunga', 0),
    (1990, 'Branco', 'branco', 0),
    (1994, 'Romario', 'romario', 0),
    (1994, 'Bebeto', 'bebeto', 0),
    (1998, 'Rivaldo', 'rivaldo', 0),
    (1998, 'Cafu', 'cafu', 0),
    (2002, 'Ronaldo', 'ronaldo', 0),
    (2002, 'Ronaldinho Gaucho', 'ronaldinho-gaucho', 0),
    (2006, 'Kaka', 'kaka', 0),
    (2006, 'Adriano', 'adriano', 0),
    (2010, 'Lucio', 'lucio', 0),
    (2010, 'Luis Fabiano', 'luis-fabiano', 0),
    (2014, 'Neymar', 'neymar', 0),
    (2014, 'Thiago Silva', 'thiago-silva', 0),
    (2018, 'Philippe Coutinho', 'philippe-coutinho', 0),
    (2018, 'Casemiro', 'casemiro', 0),
    (2022, 'Vinicius Junior', 'vinicius-junior', 0),
    (2022, 'Richarlison', 'richarlison', 0),
    (2026, 'Endrick', 'endrick', 0),
    (2026, 'Rodrygo', 'rodrygo', 0)
)
insert into public.players (name, image_url, world_cup_id, votes_count)
select
  player_seed.name,
  'https://api.dicebear.com/9.x/notionists-neutral/png?seed=' || replace(player_seed.name, ' ', '%20') || '&backgroundColor=f6d44b',
  world_cups.id,
  player_seed.votes_count
from player_seed
join public.world_cups on world_cups.year = player_seed.year
on conflict (name) do update
set
  image_url = excluded.image_url,
  world_cup_id = excluded.world_cup_id,
  votes_count = greatest(public.players.votes_count, excluded.votes_count);
