import { mockCups, mockRanking } from "@/lib/mock-data";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { CupMatchup, RankingPlayer } from "@/types/domain";

type PlayerWithVotes = {
  id: string;
  name: string;
  image_url: string;
  world_cup_id: string;
  votes_count: number;
};

export async function getCupMatchups(): Promise<CupMatchup[]> {
  if (!isSupabaseConfigured || !supabase) {
    return mockCups;
  }

  const { data, error } = await supabase
    .from("world_cups")
    .select("id, year, host_country, players(id, name, image_url, world_cup_id, votes_count)")
    .order("year", { ascending: true });

  if (error || !data) {
    console.error("Failed to load cup matchups", error);
    return mockCups;
  }

  return data.map((cup) => ({
    ...cup,
    players: ((cup.players ?? []) as PlayerWithVotes[]).sort((a, b) => a.name.localeCompare(b.name))
  }));
}

export async function getRanking(): Promise<RankingPlayer[]> {
  if (!isSupabaseConfigured || !supabase) {
    return mockRanking;
  }

  const { data, error } = await supabase
    .from("players")
    .select("id, name, image_url, world_cup_id, votes_count, world_cups(id, year, host_country)")
    .order("votes_count", { ascending: false })
    .order("world_cups(year)", { ascending: false });

  if (error || !data) {
    console.error("Failed to load ranking", error);
    return mockRanking;
  }

  return data as unknown as RankingPlayer[];
}
