import type { CupMatchup, RankingPlayer } from "@/types/domain";

const cupRows = [
  [1930, "Uruguai", ["Preguinho", "Fausto"]],
  [1934, "Italia", ["Leonidas", "Waldemar de Brito"]],
  [1938, "Franca", ["Domingos da Guia", "Romeu Pellicciari"]],
  [1950, "Brasil", ["Zizinho", "Ademir de Menezes"]],
  [1954, "Suica", ["Didi", "Julinho Botelho"]],
  [1958, "Suecia", ["Garrincha", "Nilton Santos"]],
  [1962, "Chile", ["Vava", "Amarildo"]],
  [1966, "Inglaterra", ["Tostao", "Rivelino"]],
  [1970, "Mexico", ["Pele", "Jairzinho"]],
  [1974, "Alemanha Ocidental", ["Carlos Alberto Torres", "Leao"]],
  [1978, "Argentina", ["Roberto Dinamite", "Dirceu"]],
  [1982, "Espanha", ["Zico", "Socrates"]],
  [1986, "Mexico", ["Careca", "Junior"]],
  [1990, "Italia", ["Dunga", "Branco"]],
  [1994, "Estados Unidos", ["Romario", "Bebeto"]],
  [1998, "Franca", ["Rivaldo", "Roberto Carlos"]],
  [2002, "Coreia do Sul e Japao", ["Ronaldo", "Cafu"]],
  [2006, "Alemanha", ["Kaka", "Ronaldinho Gaucho"]],
  [2010, "Africa do Sul", ["Lucio", "Luis Fabiano"]],
  [2014, "Brasil", ["Neymar", "Thiago Silva"]],
  [2018, "Russia", ["Philippe Coutinho", "Casemiro"]],
  [2022, "Catar", ["Vinicius Junior", "Richarlison"]],
  [2026, "Canada, Mexico e EUA", ["Endrick", "Rodrygo"]]
] as const;

const initialVotes: Record<string, number> = {
  pele: 385192,
  jairzinho: 104892,
  garrincha: 312756,
  zico: 245981,
  romario: 198567,
  ronaldo: 176342,
  cafu: 142308
};

const referenceImages: Record<string, string> = {
  pele: "/reference/pele.png?v=2",
  jairzinho: "/reference/jairzinho.png?v=2",
  garrincha: "/reference/garrincha.png?v=2",
  zico: "/reference/zico.png?v=2",
  romario: "/reference/romario.png?v=2",
  ronaldo: "/reference/ronaldo.png?v=2",
  cafu: "/reference/cafu.png?v=2"
};

export const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const mockCups: CupMatchup[] = cupRows.map(([year, host_country, names]) => {
  const cupId = `cup-${year}`;

  return {
    id: cupId,
    year,
    host_country,
    players: names.map((name) => {
      const id = slugify(name);

      return {
        id,
        name,
        image_url:
          referenceImages[id] ??
          `https://api.dicebear.com/9.x/notionists-neutral/png?seed=${encodeURIComponent(name)}&backgroundColor=f6d44b`,
        world_cup_id: cupId,
        votes_count: initialVotes[id] ?? 0
      };
    })
  };
});

export const mockRanking: RankingPlayer[] = mockCups
  .flatMap((cup) =>
    cup.players.map((player) => ({
      ...player,
      votes_count: player.votes_count ?? 0,
      world_cups: {
        id: cup.id,
        year: cup.year,
        host_country: cup.host_country
      }
    }))
  )
  .filter((player) => player.votes_count > 0)
  .sort((a, b) => b.votes_count - a.votes_count || b.world_cups.year - a.world_cups.year);
