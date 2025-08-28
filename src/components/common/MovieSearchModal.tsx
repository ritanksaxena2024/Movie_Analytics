'use client';
import { useEffect, useState, useRef } from "react";
import Portal from "./Portal";

type Person = { name: string; profile: string | null };

type MovieDetail = {
  id: number;
  title: string;
  rating: number;
  runtime?: number;
  overview?: string;
  teaser_url?: string | null;
  cast: Person[];
  directors: Person[];
  genres: string[];
};

interface SearchMovieModalProps {
  movieId: number;
  onClose: () => void;
}

export default function SearchMovieModal({ movieId, onClose }: SearchMovieModalProps) {
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const modalRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  const fetchMovie = async () => {
    try {
      const res = await fetch(`/api/movie-details?id=${movieId}`);
      const data = await res.json();

   
      const movieData = data.movie || data; 

      if (!movieData) {
        console.error("Movie data not found:", data);
        return;
      }

    setMovie({
  id: movieData.id,
  title: movieData.title,
  rating: movieData.rating,
  runtime: movieData.runtime,
  cast: movieData.cast || [],          
  directors: movieData.directors || [],
  genres: movieData.genres || [],     
});
    } catch (err) {
      console.error("Error fetching movie:", err);
    }
  };

  if (movieId) {
    fetchMovie();
  }
}, [movieId]);


  // Close modal on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [onClose]);

  const renderAvatar = (person: Person) => {
    if (person.profile) {
      return <img src={person.profile} alt={person.name} className="w-20 h-20 rounded-full object-cover mb-1" />;
    }
    const initials = person.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
    return (
      <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center mb-1 text-white font-semibold">
        {initials}
      </div>
    );
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
        <div
          ref={modalRef}
          className="bg-[var(--surface)] w-11/12 md:w-3/4 lg:w-2/3 h-[90vh] rounded-xl overflow-hidden flex flex-col relative"
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-[var(--text-primary)] text-2xl font-bold hover:text-[var(--primary)] z-20"
          >
            &times;
          </button>

          {/* Video */}
          <div className="w-full h-1/2 bg-black flex items-center justify-center">
            {loading ? (
              <div className="text-[var(--text-primary)]">Loading video...</div>
            ) : movie?.teaser_url ? (
              <iframe
                className="w-full h-full"
                src={movie.teaser_url.replace("watch?v=", "embed/")}
                title={movie.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="text-[var(--text-primary)]">No Trailer Available</div>
            )}
          </div>

          {/* Movie Info */}
          <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-[var(--text-primary)] text-2xl font-bold">{movie?.title}</h2>
                <p className="text-[var(--text-secondary)] mt-1">{movie?.overview}</p>
                <p className="text-[var(--text-secondary)] mt-1">Rating: {movie?.rating}</p>
                <p className="text-[var(--text-secondary)] mt-1">
                  Runtime: {movie?.runtime ?? "N/A"} min
                </p>
                <p className="text-[var(--text-secondary)] mt-1">
                  Genres: {movie?.genres.join(", ")}
                </p>
              </div>
              {/* Directors */}
              <div className="flex flex-col items-center ml-4">
                <h3 className="text-[var(--text-primary)] mb-2">Directors</h3>
                {movie?.directors.map((d, idx) => (
                  <div key={idx} className="flex flex-col items-center mb-2 text-center">
                    {renderAvatar(d)}
                    <span className="text-sm text-[var(--text-primary)] break-words leading-snug">{d.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cast */}
            <div>
              <h3 className="text-[var(--text-primary)] mb-2">Cast</h3>
              <div className="flex gap-4 overflow-x-auto [&::-webkit-scrollbar]:hidden scrollbar-none">
                {movie?.cast.map((c, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center min-w-[80px] text-center text-[var(--text-primary)]"
                  >
                    {renderAvatar(c)}
                    <span className="text-sm break-words leading-snug">{c.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}
