export type WorldCup = {
  id: string;
  year: number;
  host_country: string;
};

export type Player = {
  id: string;
  name: string;
  image_url: string;
  world_cup_id: string;
  created_at?: string;
  votes_count?: number;
  world_cups?: WorldCup;
};

export type CupMatchup = WorldCup & {
  players: Player[];
};

export type RankingPlayer = Player & {
  votes_count: number;
  world_cups: WorldCup;
};

export type VoteResponse = {
  ok: boolean;
  message: string;
  player?: RankingPlayer;
};
