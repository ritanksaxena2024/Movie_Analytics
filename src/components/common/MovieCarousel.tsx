"use client";

type Movie = {
  id: number;
  title: string;
  year: string | null;
  rating: number;
  poster: string | null;
  overview: string;
};

interface MovieCarouselProps {
  title: string;
  movies?: Movie[];
  onCardClick?: (id: number) => void; // <-- handler
}

export default function MovieCarousel({ title, movies, onCardClick }: MovieCarouselProps) {
  if (!movies || movies.length === 0) {
    return (
      <section className="w-full px-6 py-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">{title}</h2>
        <p className="text-gray-400 text-sm">No movies found.</p>
      </section>
    );
  }

  return (
    <section className="w-full px-6 py-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-4">{title}</h2>
      <div
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4
                   [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {movies.map((movie) => (
          <div
            key={movie.id}
            className="snap-start shrink-0 w-40 sm:w-48 md:w-56 lg:w-64 cursor-pointer"
            onClick={() => onCardClick?.(movie.id)} // <-- trigger click
          >
            <div className="bg-gray-900 rounded-lg overflow-hidden shadow-lg hover:scale-105 transition-transform">
              {movie.poster ? (
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-full h-64 object-cover"
                />
              ) : (
                <div className="w-full h-64 bg-gray-700 flex items-center justify-center text-gray-300">
                  No Image
                </div>
              )}
              <div className="p-3 text-white">
                <h3 className="text-sm font-semibold truncate">{movie.title}</h3>
                <p className="text-xs text-gray-400">{movie.year || "N/A"}</p>
                <p className="text-xs text-yellow-400">⭐ {movie.rating.toFixed(1)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
