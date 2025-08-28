import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

// ✅ Define types for TMDB movie and response
interface TMDBMovie {
  id: number;
  title: string;
  release_date?: string;
  vote_average: number;
  poster_path?: string | null;
  overview: string;
}

interface TMDBResponse {
  results: TMDBMovie[];
}

interface NormalizedMovie {
  id: number;
  title: string;
  year: string | null;
  rating: number;
  poster: string | null;
  overview: string;
}

// ✅ Strongly typed normalize function
function normalizeMovies(results: TMDBMovie[]): NormalizedMovie[] {
  return results.map((m) => ({
    id: m.id,
    title: m.title,
    year: m.release_date ? m.release_date.split("-")[0] : null,
    rating: m.vote_average,
    poster: m.poster_path
      ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
      : null,
    overview: m.overview,
  }));
}

export async function GET() {
  try {
    // 🔹 Fetch all 3 categories in parallel
    const [trendingRes, newRes, upcomingRes] = await Promise.all([
      axios.get<TMDBResponse>(`${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}`),
      axios.get<TMDBResponse>(`${TMDB_BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}`),
      axios.get<TMDBResponse>(`${TMDB_BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}`),
    ]);

    const trending = normalizeMovies(trendingRes.data.results);
    const newArrivals = normalizeMovies(newRes.data.results);
    const upcoming = normalizeMovies(upcomingRes.data.results);

    return NextResponse.json({
      trending,
      newArrivals,
      upcoming,
    });
  } catch (err) {
    // ✅ Safer error handling
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
