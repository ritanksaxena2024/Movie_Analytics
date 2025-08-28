import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { supabase } from "@/app/lib/connection";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

// TMDB response types
interface TMDBMovie {
  id: number;
  title: string;
  release_date?: string;
  vote_average: number;
  runtime?: number;
}

interface TMDBMovieDetails extends TMDBMovie {
  imdb_id?: string;
  runtime?: number;
}

interface TMDBResponse {
  results: TMDBMovie[];
}

type MovieInsert = {
  imdb_id: string;
  title: string;
  year?: number | null;
  rating: number;
  runtime?: number | null;
  teaser_url?: string | null;
};

type SearchLogInsert = {
  query: string;
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("search");

  try {
    if (!query) {
      return NextResponse.json({ error: "Missing search query" }, { status: 400 });
    }

    // Log search query
    await supabase.from("search_logs").insert<SearchLogInsert>({ query });

    // Check cached movies
    const { data: cachedMovies, error: cacheErr } = await supabase
      .from("movies")
      .select("*")
      .ilike("title", `%${query}%`);

    if (cacheErr) throw cacheErr;

    if (cachedMovies && cachedMovies.length > 0) {
      return NextResponse.json(cachedMovies);
    }

    // Fetch from TMDB API
    const response = await axios.get<TMDBResponse>(`${TMDB_BASE_URL}/search/movie`, {
      params: { api_key: TMDB_API_KEY, query },
    });

    const results = response.data.results;

    // Fetch details for each movie to get imdb_id
    const detailedMovies = await Promise.all(
      results.map(async (m) => {
        try {
          const detailRes = await axios.get<TMDBMovieDetails>(
            `${TMDB_BASE_URL}/movie/${m.id}`,
            { params: { api_key: TMDB_API_KEY } }
          );
          const d = detailRes.data;
          return {
            imdb_id: d.imdb_id?.replace("tt", "") || String(m.id),
            title: d.title,
            year: d.release_date ? parseInt(d.release_date.split("-")[0]) : null,
            rating: d.vote_average,
            runtime: d.runtime ?? null,
            teaser_url: null,
          } as MovieInsert;
        } catch (err) {
          console.error(`Failed to fetch details for movie ${m.id}:`, err);
          return null;
        }
      })
    );

    const moviesToInsert = detailedMovies.filter((m): m is MovieInsert => m !== null);

    if (moviesToInsert.length > 0) {
      const { data: inserted, error: insertErr } = await supabase
        .from("movies")
        .upsert(moviesToInsert, { onConflict: "imdb_id" }) // ✅ avoid duplicates
        .select("*");

      if (insertErr) throw insertErr;

      return NextResponse.json(inserted);
    }

    return NextResponse.json([]);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Search API error:", err.message);
      return NextResponse.json({ error: err.message }, { status: 500 });
    } else {
      console.error("Search API error:", err);
      return NextResponse.json({ error: "Unknown error" }, { status: 500 });
    }
  }
}
