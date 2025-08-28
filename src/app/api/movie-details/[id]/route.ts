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
interface TMDBFindResponse {
  movie_results: Array<{ id: number; title: string; release_date?: string }>;
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
  console.log("\n" + "=".repeat(60));
  console.log("🎬 MOVIE DETAILS API CALLED");
  console.log("=".repeat(60));

  try {
    let { id } = await context.params;
    console.log("📥 Received ID:", id, "(type:", typeof id, ")");

    if (!id || id.trim() === "") {
      console.log("❌ Empty ID provided");
      return NextResponse.json({ message: "Movie ID is required" }, { status: 400 });
    }

    let existingMovie: DBMovie | null = null;
    const isNumericId = /^\d+$/.test(id);
    console.log("🔢 Is numeric ID:", isNumericId);

    // --- Step 1: Try to find movie in DB ---
    console.log("\n📊 STEP 1: Database Lookup");
    console.log("-".repeat(30));

    try {
      if (isNumericId) {
        console.log("🔍 Searching by Database ID:", id);
        const { data: movieById, error } = await supabase
          .from("movies")
          .select(`
            *,
            movie_genres ( genres (name) ),
            movie_directors ( directors (name) ),
            movie_actors ( actors (name) )
          `)
          .eq("id", parseInt(id))
          .single<DBMovie>();
        
        if (error) {
          console.log("❌ Database lookup error:", error.message);
          throw error;
        }
        
        existingMovie = movieById;
        console.log("✅ Found by DB ID:", existingMovie?.title || "null");
      } else {
        console.log("🔍 Searching by IMDB ID:", id);
        const { data: movieByImdbId, error } = await supabase
          .from("movies")
          .select(`
            *,
            movie_genres ( genres (name) ),
            movie_directors ( directors (name) ),
            movie_actors ( actors (name) )
          `)
          .eq("imdb_id", id)
          .single<DBMovie>();
        
        if (error) {
          console.log("❌ Database lookup error:", error.message);
          throw error;
        }
        
        existingMovie = movieByImdbId;
        console.log("✅ Found by IMDB ID:", existingMovie?.title || "null");
      }
    } catch (dbError) {
      console.log("📝 Movie not found in database, will fetch from TMDB");
      console.log("📝 DB Error:", dbError instanceof Error ? dbError.message : "Unknown error");
      existingMovie = null;
    }

    // --- Step 2: Check if DB movie is complete ---
    if (existingMovie) {
      console.log("\n📋 STEP 2: Check DB Data Completeness");
      console.log("-".repeat(40));
      console.log("✅ Found movie in DB:", existingMovie.title);
      console.log("📊 Movie details:", {
        id: existingMovie.id,
        imdb_id: existingMovie.imdb_id,
        title: existingMovie.title,
        year: existingMovie.year,
        runtime: existingMovie.runtime,
        rating: existingMovie.rating
      });

      const hasTrailer = !!existingMovie.teaser_url;
      const hasActors = !!(existingMovie.movie_actors?.length);
      const hasDirectors = !!(existingMovie.movie_directors?.length);
      const hasGenres = !!(existingMovie.movie_genres?.length);

      console.log("📊 Data completeness check:");
      console.log("  - Trailer:", hasTrailer ? "✅" : "❌");
      console.log("  - Actors:", hasActors ? `✅ (${existingMovie.movie_actors?.length})` : "❌");
      console.log("  - Directors:", hasDirectors ? `✅ (${existingMovie.movie_directors?.length})` : "❌");
      console.log("  - Genres:", hasGenres ? `✅ (${existingMovie.movie_genres?.length})` : "❌");

      const hasCompleteData = hasTrailer && hasActors && hasDirectors && hasGenres;

      if (hasCompleteData) {
        console.log("🎉 Complete data found in DB, returning cached version");
        return NextResponse.json({
          movie: {
            id: existingMovie.id,
            title: existingMovie.title,
            rating: existingMovie.rating,
            runtime: existingMovie.runtime,
            overview: null,
          },
          videos: existingMovie.teaser_url ? [{ url: existingMovie.teaser_url }] : [],
          cast:
            existingMovie.movie_actors?.map((actor) => ({
              name: actor.actors.name,
              profile: null,
            })) ?? [],
          directors: existingMovie.movie_directors?.map((d) => d.directors.name) ?? [],
          genres: existingMovie.movie_genres?.map((g) => g.genres.name) ?? [],
          source: "database",
        });
      } else {
        console.log("⚠️ DB data incomplete, will fetch from TMDB to fill missing data");
        // Use the IMDB ID for TMDB lookup
        id = existingMovie.imdb_id.startsWith("tt") ? existingMovie.imdb_id : `tt${existingMovie.imdb_id}`;
        console.log("🔄 Switched to IMDB ID for TMDB lookup:", id);
      }
    }

    // --- Step 3: Fetch from TMDB ---
    console.log("\n🎬 STEP 3: TMDB Fetch");
    console.log("-".repeat(30));
    console.log("🔍 Fetching from TMDB with ID:", id);
    
    let tmdbId = id;

    // Handle IMDB ID conversion
    if (id.startsWith("tt") || (existingMovie && !isNumericId)) {
      const imdbId = id.startsWith("tt") ? id : `tt${id}`;
      console.log("🔄 Converting IMDB ID → TMDB ID:", imdbId);

      const searchRes = await axios.get<TMDBFindResponse>(
        `${TMDB_BASE_URL}/find/${imdbId}`,
        { params: { api_key: TMDB_API_KEY, external_source: "imdb_id" } }
      );

      console.log("📊 TMDB Find response:", {
        movie_results_count: searchRes.data.movie_results.length
      });

      if (searchRes.data.movie_results.length > 0) {
        tmdbId = searchRes.data.movie_results[0].id.toString();
        console.log("✅ Converted to TMDB ID:", tmdbId);
        console.log("🎬 Found movie:", searchRes.data.movie_results[0].title);
      } else {
        console.warn("⚠️ No movie found on TMDB for:", imdbId);
        return NextResponse.json({ message: `Movie not found for IMDB ID: ${imdbId}` }, { status: 404 });
      }
    }

    // Fetch detailed data from TMDB
    console.log("📡 Fetching detailed data from TMDB for ID:", tmdbId);
    
    const [detailsRes, creditsRes, videosRes] = await Promise.all([
      axios.get<TMDBMovieDetails>(`${TMDB_BASE_URL}/movie/${tmdbId}`, { params: { api_key: TMDB_API_KEY } }),
      axios.get<TMDBCredits>(`${TMDB_BASE_URL}/movie/${tmdbId}/credits`, { params: { api_key: TMDB_API_KEY } }),
      axios.get<TMDBVideos>(`${TMDB_BASE_URL}/movie/${tmdbId}/videos`, { params: { api_key: TMDB_API_KEY } }),
    ]);

    const details = detailsRes.data;
    const credits = creditsRes.data;
    const videos = videosRes.data;

    console.log("✅ TMDB data fetched successfully:");
    console.log("  - Title:", details.title);
    console.log("  - IMDB ID:", details.imdb_id);
    console.log("  - Cast members:", credits.cast.length);
    console.log("  - Directors:", credits.crew.filter(m => m.job === "Director").length);
    console.log("  - Videos:", videos.results.length);

    const trailer = videos.results.find(
      (v) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")
    );
    const trailerUrl = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;
    console.log("🎥 Trailer found:", !!trailerUrl, trailerUrl ? `(${trailer?.type})` : "");

    // --- Step 4: Save/Update DB ---
    console.log("\n💾 STEP 4: Database Save/Update");
    console.log("-".repeat(35));
    
    try {
      const movieData = {
        id: existingMovie?.id, // Keep existing DB ID if we have it
        imdb_id: details.imdb_id || id,
        title: details.title,
        year: details.release_date ? parseInt(details.release_date.split("-")[0]) : null,
        runtime: details.runtime ?? null,
        rating: details.vote_average,
        teaser_url: trailerUrl,
      };

      console.log("💾 Saving movie data:", movieData);

      await supabase.from("movies").upsert(
        movieData,
        { onConflict: existingMovie ? "id" : "imdb_id" }
      );
      console.log("✅ Movie saved/updated in DB:", details.title);
    } catch (dbErr) {
      console.error("⚠️ Failed to save movie in DB:", dbErr);
    }

    // --- Step 5: Return Response ---
    console.log("\n📤 STEP 5: Preparing Response");
    console.log("-".repeat(32));

    const response = {
      movie: {
        id: existingMovie?.id || parseInt(tmdbId),
        title: details.title,
        rating: details.vote_average,
        runtime: details.runtime,
        overview: details.overview,
      },
      videos: trailerUrl ? [{ url: trailerUrl }] : [],
      cast: credits.cast.slice(0, 10).map((a) => ({
        name: a.name,
        profile: a.profile_path ? `https://image.tmdb.org/t/p/w500${a.profile_path}` : null,
      })),
      directors: credits.crew.filter((m) => m.job === "Director").map((d) => d.name),
      genres: details.genres.map((g) => g.name),
      source: "tmdb",
    };

    console.log("🎉 Response prepared:");
    console.log("  - Movie ID:", response.movie.id);
    console.log("  - Title:", response.movie.title);
    console.log("  - Cast count:", response.cast.length);
    console.log("  - Directors count:", response.directors.length);
    console.log("  - Source:", response.source);
    console.log("=".repeat(60) + "\n");

    return NextResponse.json(response);

  } catch (err) {
    console.error("\n❌ UNEXPECTED ERROR:");
    console.error("=".repeat(30));
    console.error("Error:", err);
    console.error("=".repeat(60) + "\n");
    
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ message: `Internal error: ${msg}` }, { status: 500 });
  }
}