export const dynamic = "force-dynamic";

import { getCupMatchups, getRanking } from "@/lib/queries";
import HomeClient from "./home-client";

export default async function Home() {
  const [cups, ranking] = await Promise.all([getCupMatchups(), getRanking()]);

  return <HomeClient initialCups={cups} initialRanking={ranking} />;
}
