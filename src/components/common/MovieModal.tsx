'use client';
import { useEffect, useState, useRef } from "react";
import Portal from "./Portal";

type Person = { name: string; profile: string | null };

type MovieDetail = {
  id: number;
  title: string;
  rating: number;
  teaser_url?: string | null;
  cast: Person[];
  directors: Person[];
};

interface MovieModalProps {
  movieId: number;
  onClose: () => void;
}

interface MovieApiResponse {
  movie?: {
    id: number;
    title: string;
    rating: number;
  };
  videos?: { url: string }[];
  cast?: { name: string; profile: string | null }[];
  directors?: string[];
}

export default function MovieModal({ movieId, onClose }: MovieModalProps) {
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  console.log("this is the movieId recieved", movieId)
  useEffect(() => {
    setLoading(true);
    setError(null);

    const fetchMovie = async () => {
      try {
        const res = await fetch(`/api/movie-details/${movieId}`);
        console.log("url hit is ", `/api/movie-details/${movieId}`)
        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }
        const data: MovieApiResponse = await res.json();
        console.log(data)
        if (!data) {
          throw new Error("Movie data not found in response");
        }

        setMovie({
          id: data.movie.id,
          title: data.movie.title,
          rating: data.movie.rating,
          teaser_url: data.videos?.[0]?.url ?? null,
          cast: data.cast?.map(c => ({ name: c.name, profile: c.profile })) ?? [],
          directors: data.directors?.map(d => ({ name: d, profile: null })) ?? [],
        });
      } catch {
        console.error("Failed to fetch movie:");
        setError("error");
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [movieId]);

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
      return (
        <img
          src={person.profile}
          alt={person.name}
          className="w-20 h-20 rounded-full object-cover mb-1"
        />
      );
    }
    const initials = person.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
    return (
      <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center mb-1 text-white font-semibold text-lg">
        {initials}
      </div>
    );
  };

  return (
    <Portal>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-70"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      >
        <div
          ref={modalRef}
          className="bg-gray-900 w-11/12 md:w-3/4 lg:w-2/3 h-[90vh] rounded-xl overflow-hidden flex flex-col relative"
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-white text-2xl font-bold hover:text-red-500 z-20"
          >
            &times;
          </button>

          <div className="w-full h-1/2 bg-black flex items-center justify-center">
            {loading ? (
              <div className="text-white">Loading video...</div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : movie?.teaser_url ? (
              <iframe
                className="w-full h-full"
                src={movie.teaser_url.replace("watch?v=", "embed/")}
                title={movie.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <div className="text-white">No Trailer Available</div>
            )}
          </div>

          {/* Lower half - cast & directors */}
          <div className="flex-1 p-4 flex flex-col gap-4 overflow-hidden">
            {/* Cast */}
            <h2 className="text-white text-xl mb-2">Cast</h2>
            <div className="flex gap-4 overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden scrollbar-none">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center w-20 sm:w-24 md:w-28 lg:w-32 flex-shrink-0">
                      <div className="w-20 h-20 rounded-full bg-gray-700 animate-pulse mb-1"></div>
                      <div className="w-16 h-3 bg-gray-600 animate-pulse"></div>
                    </div>
                  ))
                : movie?.cast.map((person, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col items-center w-20 sm:w-24 md:w-28 lg:w-32 flex-shrink-0 text-center text-white"
                    >
                      {renderAvatar(person)}
                      <span className="text-sm leading-snug mt-1 line-clamp-2 break-words">
                        {person.name}
                      </span>
                    </div>
                  ))}
            </div>

            {/* Directors */}
            <h2 className="text-white text-xl mt-4 mb-2">Directors</h2>
            <div className="flex gap-4 overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden scrollbar-none">
              {loading
                ? Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center w-20 sm:w-24 md:w-28 lg:w-32 flex-shrink-0">
                      <div className="w-20 h-20 rounded-full bg-gray-700 animate-pulse mb-1"></div>
                      <div className="w-16 h-3 bg-gray-600 animate-pulse"></div>
                    </div>
                  ))
                : movie?.directors.map((person, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col items-center w-20 sm:w-24 md:w-28 lg:w-32 flex-shrink-0 text-center text-white"
                    >
                      {renderAvatar(person)}
                      <span className="text-sm leading-snug mt-1 line-clamp-2 break-words">
                        {person.name}
                      </span>
                    </div>
                  ))}
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}
