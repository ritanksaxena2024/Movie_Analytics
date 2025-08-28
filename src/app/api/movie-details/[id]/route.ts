import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { supabase } from "@/app/lib/connection";

const TMDB_API_KEY = process.env.TMDB_API_KEY!;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

// --- TMDB types ---
interface TMDBGenre { id: number; name: string; }
interface TMDBMovieDetails {
  id: number;
  title: string;
  release_date?: string;
  runtime?: number;
  vote_average: number;
  overview?: string;
  genres: TMDBGenre[];
  poster_path?: string;
  imdb_id?: string;
}
interface TMDBCastMember { id: number; name: string; character: string; profile_path?: string; }
interface TMDBCrewMember { id: number; name: string; job: string; }
interface TMDBCredits { cast: TMDBCastMember[]; crew: TMDBCrewMember[]; }
interface TMDBVideoResult { name: string; key: string; site: string; type: string; }
interface TMDBVideos { results: TMDBVideoResult[]; }

// 🔹 FIX: Proper type for `/find/{imdb_id}` endpoint
interface TMDBFindResponse {
  movie_results: Array<{
    id: number;
    title: string;
    release_date?: string;
  }>;
  tv_results: unknown[];
  person_results: unknown[];
}

// --- DB types ---
interface DBGenre { genres: { name: string }; }
interface DBDirector { directors: { name: string }; }
interface DBActor { actors: { name: string }; }
interface DBMovie {
  id: number;
  imdb_id: string;
  title: string;
  year: number | null;
  runtime: number | null;
  rating: number;
  teaser_url: string | null;
  movie_genres?: DBGenre[];
  movie_directors?: DBDirector[];
  movie_actors?: DBActor[];
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    let { id } = await context.params;

    console.log("➡️ API CALLED with param id:", id);

    let existingMovie: DBMovie | null = null;
    const isNumericId = /^\d+$/.test(id);

    if (isNumericId) {
      const { data: movieById } = await supabase
        .from("movies")
        .select(`
          *,
          movie_genres ( genres (name) ),
          movie_directors ( directors (name) ),
          movie_actors ( actors (name) )
        `)
        .eq("id", parseInt(id))
        .single<DBMovie>();

      existingMovie = movieById;
    }

    if (!existingMovie) {
      const { data: movieByImdbId } = await supabase
        .from("movies")
        .select(`
          *,
          movie_genres ( genres (name) ),
          movie_directors ( directors (name) ),
          movie_actors ( actors (name) )
        `)
        .eq("imdb_id", id)
        .single<DBMovie>();

      existingMovie = movieByImdbId;
    }

    // If we already have complete DB data
    if (existingMovie) {
      const hasCompleteData =
        !!existingMovie.teaser_url &&
        !!existingMovie.movie_actors?.length &&
        !!existingMovie.movie_directors?.length &&
        !!existingMovie.movie_genres?.length;

      if (hasCompleteData) {
        return NextResponse.json({
          movie: {
            id: existingMovie.id,
            title: existingMovie.title,
            rating: existingMovie.rating,
            runtime: existingMovie.runtime,
            overview: null,
          },
          videos: existingMovie.teaser_url
            ? [{ url: existingMovie.teaser_url }]
            : [],
          cast:
            existingMovie.movie_actors?.map((actor) => ({
              name: actor.actors.name,
              profile: null,
            })) ?? [],
          directors:
            existingMovie.movie_directors?.map(
              (director) => director.directors.name
            ) ?? [],
          genres:
            existingMovie.movie_genres?.map(
              (genre) => genre.genres.name
            ) ?? [],
          source: "database",
        });
      } else {
        // if incomplete → use imdb_id for TMDB fetch
        id = existingMovie.imdb_id;
      }
    }

    // --- Fetch from TMDB ---
    let tmdbId = id;

    if (id.startsWith("tt") || existingMovie?.imdb_id) {
      const imdbId = existingMovie?.imdb_id || id;
      try {
        const searchRes = await axios.get<TMDBFindResponse>(
          `${TMDB_BASE_URL}/find/${imdbId}`,
          { params: { api_key: TMDB_API_KEY, external_source: "imdb_id" } }
        );

        if (searchRes.data.movie_results.length > 0) {
          tmdbId = searchRes.data.movie_results[0].id.toString();
        }
      } catch {
        console.warn("⚠️ TMDB search by imdb_id failed, using id directly");
      }
    }

    const [detailsRes, creditsRes, videosRes] = await Promise.all([
      axios.get<TMDBMovieDetails>(
        `${TMDB_BASE_URL}/movie/${tmdbId}`,
        { params: { api_key: TMDB_API_KEY } }
      ),
      axios.get<TMDBCredits>(
        `${TMDB_BASE_URL}/movie/${tmdbId}/credits`,
        { params: { api_key: TMDB_API_KEY } }
      ),
      axios.get<TMDBVideos>(
        `${TMDB_BASE_URL}/movie/${tmdbId}/videos`,
        { params: { api_key: TMDB_API_KEY } }
      ),
    ]);

    const details = detailsRes.data;
    const credits = creditsRes.data;
    const videos = videosRes.data;

    const trailer = videos.results.find(
      (video) =>
        video.site === "YouTube" &&
        (video.type === "Trailer" || video.type === "Teaser")
    );
    const trailerUrl = trailer
      ? `https://www.youtube.com/watch?v=${trailer.key}`
      : null;

    // --- Upsert into DB ---
    const { data: insertedMovie } = await supabase
      .from("movies")
      .upsert(
        {
          id: existingMovie?.id,
          imdb_id: details.imdb_id || id,
          title: details.title,
          year: details.release_date
            ? parseInt(details.release_date.split("-")[0])
            : null,
          runtime: details.runtime ?? null,
          rating: details.vote_average,
          teaser_url: trailerUrl,
        },
        { onConflict: existingMovie ? "id" : "imdb_id" }
      )
      .select("*")
      .single<DBMovie>();

    // --- Build response ---
    return NextResponse.json({
      movie: {
        id: existingMovie?.id || insertedMovie?.id || parseInt(tmdbId),
        title: details.title,
        rating: details.vote_average,
        runtime: details.runtime,
        overview: details.overview,
      },
      videos: trailerUrl ? [{ url: trailerUrl }] : [],
      cast: credits.cast.slice(0, 10).map((actor) => ({
        name: actor.name,
        profile: actor.profile_path
          ? `https://image.tmdb.org/t/p/w500${actor.profile_path}`
          : null,
      })),
      directors: credits.crew
        .filter((m) => m.job === "Director")
        .map((d) => d.name),
      genres: details.genres.map((g) => g.name),
      source: "tmdb",
    });
  } catch (err) {
    console.error("❌ Error in GET handler:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
