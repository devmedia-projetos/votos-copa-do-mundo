import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

type VotePayload = {
  playerId?: string;
  worldCupId?: string;
  sessionId?: string;
};

export async function POST(request: Request) {
  let payload: VotePayload;

  try {
    payload = (await request.json()) as VotePayload;
  } catch {
    return NextResponse.json({ ok: false, message: "JSON invalido." }, { status: 400 });
  }

  const { playerId, worldCupId, sessionId } = payload;

  if (!playerId || !worldCupId || !sessionId) {
    return NextResponse.json({ ok: false, message: "Dados obrigatorios ausentes." }, { status: 400 });
  }

  const supabase = createSupabaseAdmin();

  if (!supabase) {
    return NextResponse.json(
      { ok: false, message: "Supabase nao configurado. Defina as variaveis de ambiente." },
      { status: 503 }
    );
  }

  const { data, error } = await supabase.rpc("cast_vote", {
    p_player_id: playerId,
    p_world_cup_id: worldCupId,
    p_session_id: sessionId
  });

  console.log("RPC cast_vote result:", { data, error });

  if (error) {
    const status = error.message.includes("already_voted") ? 409 : 400;
    const message = error.message.includes("already_voted")
      ? "Voce ja votou nesta edicao da Copa."
      : "Nao foi possivel registrar o voto.";

    return NextResponse.json({ ok: false, message }, { status });
  }

  return NextResponse.json({
    ok: true,
    message: "Voto computado com sucesso.",
    player: Array.isArray(data) ? data[0] : data
  });
}
