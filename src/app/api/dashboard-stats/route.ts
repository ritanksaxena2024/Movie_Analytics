import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/connection";

export async function GET(req: NextRequest) {
  try {
    const { data: genreDist, error: genreErr } = await supabase.rpc("genre_distribution");
    if (genreErr) throw new Error("genre_distribution failed: " + genreErr.message);

    const { data: avgRatings, error: ratingErr } = await supabase.rpc("avg_rating_per_genre");
    if (ratingErr) throw new Error("avg_rating_per_genre failed: " + ratingErr.message);

    const { data: runtimes, error: runtimeErr } = await supabase.rpc("avg_runtime_per_year");
    if (runtimeErr) throw new Error("avg_runtime_per_year failed: " + runtimeErr.message);

    const { data: actorStats, error: actorErr } = await supabase.rpc("actor_stats");
    if (actorErr) throw new Error("actor_stats failed: " + actorErr.message);

    const { data: directorStats, error: directorErr } = await supabase.rpc("director_stats");
    if (directorErr) throw new Error("director_stats failed: " + directorErr.message);

    return NextResponse.json({
      genreDistribution: genreDist,
      avgRatingsPerGenre: avgRatings,
      avgRuntimePerYear: runtimes,
      topActors: actorStats,
      topDirectors: directorStats,
    });
  } catch (err: any) {
    console.error("Stats API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
