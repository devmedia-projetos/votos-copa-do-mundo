"use client";

import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  Star,
  Trophy,
  Vote
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { CupMatchup, RankingPlayer } from "@/types/domain";

const SESSION_KEY = "melhores-copas-session-id";
const VOTED_KEY = "melhores-copas-voted";

type Props = {
  initialCups: CupMatchup[];
  initialRanking: RankingPlayer[];
};

export default function HomeClient({ initialCups, initialRanking }: Props) {
  const [cups, setCups] = useState(initialCups);
  const [ranking, setRanking] = useState(initialRanking);
  const [selectedCupId, setSelectedCupId] = useState(
    initialCups.find((cup) => cup.year === 1930)?.id ?? initialCups[0]?.id ?? ""
  );
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [votedCups, setVotedCups] = useState<Record<string, string>>({});
  const [pendingPlayerId, setPendingPlayerId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [, startTransition] = useTransition();
  const hydratedLocalVotes = useRef(false);

  const navRef = useRef<HTMLElement | null>(null);

  const yearButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

const scrollYears = (direction: "left" | "right") => {
  const slider = navRef.current;

  if (!slider) return;

  slider.scrollBy({
    left: direction === "left" ? -220 : 220,
    behavior: "smooth"
  });
};

const navigateCup = (direction: "prev" | "next") => {
  const currentIndex = selectorCups.findIndex(
    (cup) => cup.id === selectedCupId
  );

  if (currentIndex === -1) return;

  const targetIndex =
    direction === "prev"
      ? Math.max(0, currentIndex - 1)
      : Math.min(selectorCups.length - 1, currentIndex + 1);

  const targetCup = selectorCups[targetIndex];

  if (!targetCup) return;

  setSelectedCupId(targetCup.id);
  setSelectedPlayerId(votedCups[targetCup.id] ?? null);
  setErrorMessage("");

  yearButtonRefs.current[targetCup.id]?.scrollIntoView({
    behavior: "smooth",
    inline: "center",
    block: "nearest"
  });
};

  useEffect(() => {
    const slider = navRef.current;
    if (!slider) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      slider.scrollBy({
        left: e.deltaY * 2,
        behavior: "smooth"
      });
    };

    const handleMouseDown = (e: MouseEvent) => {
      isDown = true;
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
      slider.classList.add("dragging");
    };

    const handleMouseLeave = () => {
      isDown = false;
      slider.classList.remove("dragging");
    };

    const handleMouseUp = () => {
      isDown = false;
      slider.classList.remove("dragging");
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDown) return;

      e.preventDefault();

      const x = e.pageX - slider.offsetLeft;
      const walk = x - startX;

      slider.scrollLeft = scrollLeft - walk;
    };

    slider.addEventListener("wheel", handleWheel, { passive: false });
    slider.addEventListener("mousedown", handleMouseDown);
    slider.addEventListener("mouseleave", handleMouseLeave);
    slider.addEventListener("mouseup", handleMouseUp);
    slider.addEventListener("mousemove", handleMouseMove);

    return () => {
      slider.removeEventListener("wheel", handleWheel);
      slider.removeEventListener("mousedown", handleMouseDown);
      slider.removeEventListener("mouseleave", handleMouseLeave);
      slider.removeEventListener("mouseup", handleMouseUp);
      slider.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useEffect(() => {
  if (!selectedCupId) return;

  yearButtonRefs.current[selectedCupId]?.scrollIntoView({
    behavior: "smooth",
    inline: "center",
    block: "nearest"
  });
}, [selectedCupId]);

  const selectedCup = useMemo(
    () => cups.find((cup) => cup.id === selectedCupId) ?? cups[0],
    [cups, selectedCupId]
  );
  const selectorCups = useMemo(
    () => [...cups].sort((a, b) => a.year - b.year),
    [cups]
  );

  useEffect(() => {
    if (hydratedLocalVotes.current) {
      return;
    }

    hydratedLocalVotes.current = true;
    const storedVotes = window.localStorage.getItem(VOTED_KEY);
    if (storedVotes) {
      const parsedVotes = JSON.parse(storedVotes) as Record<string, string>;
      setVotedCups(parsedVotes);

      if (!isSupabaseConfigured) {
        Object.entries(parsedVotes).forEach(([cupId, playerId]) => {
          changeLocalVote(playerId, cupId, 1);
        });
      }
    }

    if (!window.localStorage.getItem(SESSION_KEY)) {
      window.localStorage.setItem(SESSION_KEY, crypto.randomUUID());
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      return;
    }

    const client = supabase;
    const channel = client
      .channel("ranking-realtime")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "players" }, async () => {
        const response = await fetch("/api/ranking");
        if (response.ok) {
          const data = (await response.json()) as { ranking: RankingPlayer[] };
          setRanking(data.ranking);
        }
      })
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, []);

  function persistVote(cupId: string, playerId: string) {
    const nextVotes = { ...votedCups, [cupId]: playerId };
    setVotedCups(nextVotes);
    window.localStorage.setItem(VOTED_KEY, JSON.stringify(nextVotes));
  }

  function changeLocalVote(playerId: string, cupId: string, delta: 1 | -1) {
    setCups((current) =>
      current.map((cup) => ({
        ...cup,
        players: cup.players.map((player) =>
          player.id === playerId
            ? { ...player, votes_count: Math.max(0, (player.votes_count ?? 0) + delta) }
            : player
        )
      }))
    );

    setRanking((current) => {
      const player = cups.flatMap((cup) => cup.players).find((item) => item.id === playerId);
      const cup = cups.find((item) => item.id === cupId);

      if (!player || !cup) {
        return current;
      }

      const existing = current.find((item) => item.id === playerId);
      if (!existing && delta < 0) {
        return current;
      }

      const next = existing
        ? current.map((item) =>
            item.id === playerId ? { ...item, votes_count: Math.max(0, item.votes_count + delta) } : item
          )
        : [
            ...current,
            {
              ...player,
              votes_count: 1,
              world_cups: {
                id: cup.id,
                year: cup.year,
                host_country: cup.host_country
              }
            }
          ];

      return next
        .filter((item) => item.votes_count > 0)
        .sort((a, b) => b.votes_count - a.votes_count || b.world_cups.year - a.world_cups.year);
    });
  }

  async function handleVote(playerId: string) {
    if (!selectedCup || votedCups[selectedCup.id] || pendingPlayerId) {
      return;
    }

    setErrorMessage("");
    setSelectedPlayerId(playerId);
    setPendingPlayerId(playerId);
    changeLocalVote(playerId, selectedCup.id, 1);

    try {
      if (!isSupabaseConfigured) {
        persistVote(selectedCup.id, playerId);
        return;
      }

      const sessionId = window.localStorage.getItem(SESSION_KEY) ?? crypto.randomUUID();
      window.localStorage.setItem(SESSION_KEY, sessionId);

      const response = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, worldCupId: selectedCup.id, sessionId })
      });

      const result = (await response.json()) as { ok: boolean; message: string };

      if (!response.ok || !result.ok) {
        throw new Error(result.message);
      }

      persistVote(selectedCup.id, playerId);
    } catch (error) {
      changeLocalVote(playerId, selectedCup.id, -1);
      setSelectedPlayerId(null);
      setErrorMessage(error instanceof Error ? error.message : "Nao foi possivel votar agora.");
    } finally {
      startTransition(() => setPendingPlayerId(null));
    }
  }

  return (
    <main className="app-shell">
      <section className="left-panel" aria-label="Area de votacao">
        <header className="hero-header">
          <div className="world-cup-mark" aria-hidden="true">
            <Image src="/reference/cup.png?v=2" alt="" fill sizes="90px" priority unoptimized />
          </div>
          <div>
            <h1>Melhores do Brasil nas Copas</h1>
          </div>
          <Image
            className="flag-badge"
            src="/reference/flag.png?v=2"
            alt="Brasil"
            width={96}
            height={74}
            priority
            unoptimized
          />
        </header>

        <div className="year-selector-wrapper">
          <button
            className="year-nav-arrow"
            onClick={() => {
              scrollYears("left");
              navigateCup("prev");
            }}
            type="button"
            aria-label="Copa anterior"
          >
            <ChevronLeft size={24} />
          </button>

          <nav
            ref={navRef}
            className="year-selector"
            aria-label="Selecionar edicao da Copa"
          >
            {selectorCups.map((cup) => (
              <button
                ref={(el) => {
                  yearButtonRefs.current[cup.id] = el;
                }}
                className={cup.id === selectedCup?.id ? "year-pill active" : "year-pill"}
                key={cup.id}
                onClick={() => {
                  setSelectedCupId(cup.id);
                  setSelectedPlayerId(votedCups[cup.id] ?? null);
                  setErrorMessage("");
                }}
                type="button"
              >
                {cup.year}
              </button>
            ))}
          </nav>

          <button
            className="year-nav-arrow"
            onClick={() => {
              scrollYears("right");
              navigateCup("next");
            }}
            type="button"
            aria-label="Proxima Copa"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {selectedCup ? (
          <section className="duel-section">
            <div className="duel-title">
              <span />
              <Star size={28} />
              <h2>Duelo</h2>
              <Star size={28} />
              <span />
            </div>
            <p className="host-line">{selectedCup.host_country}</p>

            <div className="duel-grid">
              {selectedCup.players.map((player, index) => {
                const isVoted = votedCups[selectedCup.id] === player.id;
                const isSelected = selectedPlayerId === player.id || isVoted;
                const disabled = Boolean(votedCups[selectedCup.id] || pendingPlayerId);

                return (
                  <article className={isSelected ? "player-card selected" : "player-card"} key={player.id}>
                    <div className="player-photo">
                      <Image src={player.image_url != "" ? player.image_url : "/default-player-image.jpg"} alt={player.name} fill sizes="280px" unoptimized />
                    </div>
                    <h3>{player.name}</h3>
                    <p>{selectedCup.year}</p>
                    <div className="vote-count">{(player.votes_count ?? 0).toLocaleString("pt-BR")} votos</div>
                    <button disabled={disabled} onClick={() => handleVote(player.id)} type="button">
                      {pendingPlayerId === player.id ? (
                        <LoaderCircle className="spin" size={28} />
                      ) : (
                        <Vote size={30} />
                      )}
                      {isVoted ? "Votado" : "Votar"}
                    </button>
                    {index === 0 ? <strong className="versus">Vs</strong> : null}
                  </article>
                );
              })}
            </div>

            {errorMessage ? <p className="status-message">{errorMessage}</p> : null}
          </section>
        ) : null}
      </section>

      <aside className="ranking-panel" aria-label="Ranking historico">
        <div className="ranking-heading">
          <span />
          <h2>Ranking Historico</h2>
          <span />
        </div>
        <Trophy className="ranking-trophy" size={26} />

        <ol className="ranking-list">
          {ranking.slice(0, 6).map((player, index) => (
            <li className="ranking-item" key={player.id}>
              <div className="rank-number">
                {index + 1}
                {index === 0 ? <Trophy size={18} /> : null}
              </div>
              <div className="ranking-photo">
                <Image src={player.image_url != "" ? player.image_url : "/default-player-image.jpg"} alt={player.name} fill sizes="76px" unoptimized />
              </div>
              <div className="ranking-name">
                <strong>{player.name}</strong>
                <span>{player.world_cups.year}</span>
              </div>
              <div className="ranking-votes">
                <strong>{player.votes_count.toLocaleString("pt-BR")}</strong>
                <span>votos</span>
              </div>
            </li>
          ))}
        </ol>

        <p className="ranking-note">
          <Trophy size={18} /> Ranking acumulado com base em todos os votos do publico.
        </p>
      </aside>
    </main>
  );
}
