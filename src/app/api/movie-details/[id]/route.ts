import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { supabase } from "@/app/lib/connection";

const TMDB_API_KEY = process.env.TMDB_API_KEY!;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

// TMDB types
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

export async function GET(req: NextRequest, context: any) {
  try {
    const { params } = context;
    const tmdbId = params?.id;
    if (!tmdbId) {
      return NextResponse.json({ message: "Movie ID required" }, { status: 400 });
    }

    // Check DB
    const { data: existingMovie } = await supabase
      .from("movies")
      .select(`
        *,
        movie_genres ( genres (name) ),
        movie_directors ( directors (name) ),
        movie_actors ( actors (name) )
      `)
      .eq("imdb_id", tmdbId.toString())
      .single();

    if (existingMovie) {
      const genres = existingMovie.movie_genres?.map((mg: any) => mg.genres.name) || [];
      const directors = existingMovie.movie_directors?.map((md: any) => md.directors.name) || [];
      const cast = existingMovie.movie_actors?.map((ma: any) => ({
        name: ma.actors.name,
        character: "",
        profile: null,
      })) || [];

      return NextResponse.json({
        movie: existingMovie,
        genres,
        directors,
        cast,
        videos: existingMovie.teaser_url
          ? [{ name: "Trailer", type: "Trailer", url: existingMovie.teaser_url }]
          : [],
        source: "database",
      });
    }

    // Fetch from TMDB
    const [detailsRes, creditsRes, videosRes] = await Promise.all([
      axios.get<TMDBMovieDetails>(`${TMDB_BASE_URL}/movie/${tmdbId}`, { params: { api_key: TMDB_API_KEY } }),
      axios.get<TMDBCredits>(`${TMDB_BASE_URL}/movie/${tmdbId}/credits`, { params: { api_key: TMDB_API_KEY } }),
      axios.get<TMDBVideos>(`${TMDB_BASE_URL}/movie/${tmdbId}/videos`, { params: { api_key: TMDB_API_KEY } }),
    ]);

    const details = detailsRes.data;
    const credits = creditsRes.data;
    const videos = videosRes.data.results;

    const directors = credits.crew.filter(c => c.job === "Director").map(d => d.name);
    const cast = credits.cast.slice(0, 10).map(c => ({
      name: c.name,
      character: c.character,
      profile: c.profile_path ? `https://image.tmdb.org/t/p/w500${c.profile_path}` : null,
    }));

    const movieVideos = videos
      .filter(v => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser"))
      .map(v => ({ name: v.name, type: v.type, url: `https://www.youtube.com/watch?v=${v.key}` }));

    const actualImdbId = details.imdb_id || tmdbId.toString();

    // Upsert into DB
    const { data: insertedMovie, error: movieErr } = await supabase
      .from("movies")
      .upsert({
        imdb_id: actualImdbId,
        title: details.title,
        year: details.release_date ? parseInt(details.release_date.split("-")[0]) : null,
        runtime: details.runtime ?? null,
        rating: details.vote_average,
        teaser_url: movieVideos[0]?.url ?? null,
      }, { onConflict: "imdb_id" })
      .select("*")
      .single();

    if (movieErr || !insertedMovie) throw movieErr;
    const movieDbId = insertedMovie.id;

    await Promise.all([
      supabase.from("movie_genres").delete().eq("movie_id", movieDbId),
      supabase.from("movie_directors").delete().eq("movie_id", movieDbId),
      supabase.from("movie_actors").delete().eq("movie_id", movieDbId),
    ]);

    for (const g of details.genres) {
      const { data: genre } = await supabase
        .from("genres")
        .upsert({ name: g.name }, { onConflict: "name" })
        .select("*")
        .single();
      if (genre) {
        await supabase.from("movie_genres").insert({ movie_id: movieDbId, genre_id: genre.id });
      }
    }

    for (const d of directors) {
      const { data: director } = await supabase
        .from("directors")
        .upsert({ name: d }, { onConflict: "name" })
        .select("*")
        .single();
      if (director) {
        await supabase.from("movie_directors").insert({ movie_id: movieDbId, director_id: director.id });
      }
    }

    for (const c of cast) {
      const { data: actor } = await supabase
        .from("actors")
        .upsert({ name: c.name }, { onConflict: "name" })
        .select("*")
        .single();
      if (actor) {
        await supabase.from("movie_actors").insert({ movie_id: movieDbId, actor_id: actor.id });
      }
    }

    return NextResponse.json({
      movie: insertedMovie,
      genres: details.genres.map(g => g.name),
      directors,
      cast,
      videos: movieVideos,
      source: "tmdb",
    });

  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: err.message || "Unknown error" }, { status: 500 });
  }
}
