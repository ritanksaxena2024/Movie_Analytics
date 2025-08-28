'use client'
import { useEffect, useState } from "react";
import MovieCarousel from "@/components/common/MovieCarousel";
import MovieModal from "@/components/common/MovieModal";

type Movie = {
  id: number;
  title: string;
  year: string | null;
  rating: number;
  poster: string | null;
  overview: string;
};

export default function MovieSearch() {
  const [currentImage, setCurrentImage] = useState(0);
  const [trending, setTrending] = useState<Movie[]>([]);
  const [newArrivals, setNewArrivals] = useState<Movie[]>([]);
  const [upcoming, setUpcoming] = useState<Movie[]>([]);
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);

  const bgImages = [
  
    "/images/newMovie.jpg",
     "/images/newMovie7.jpg",
      "/images/newMovie8.jpg",
   
  ];

  useEffect(() => {
    const fetchMovies = async () => {
      const res = await fetch("/api/category-movies");
      const data = await res.json();
      setTrending(data.trending || []);
      setNewArrivals(data.newArrivals || []);
      setUpcoming(data.upcoming || []);
    };
    fetchMovies();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage(prev => (prev + 1) % bgImages.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen">
      <div className="relative h-[50vh] w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000"
          style={{ backgroundImage: `url(${bgImages[currentImage]})` }}
        ></div>
      </div>

      <div className="relative z-10">
        {trending.length > 0 && (
          <div className="-mt-32">
            <MovieCarousel
              movies={trending}
              title="🔥 Trending Now"
              onCardClick={(id) => setSelectedMovieId(id)}
            />
          </div>
        )}

        {newArrivals.length > 0 && (
          <MovieCarousel
            movies={newArrivals}
            title="✨ New Arrivals"
            onCardClick={(id) => setSelectedMovieId(id)}
          />
        )}

        {upcoming.length > 0 && (
          <MovieCarousel
            movies={upcoming}
            title="🎬 Upcoming"
            onCardClick={(id) => setSelectedMovieId(id)}
          />
        )}
      </div>

      {selectedMovieId && (
        <MovieModal
          movieId={selectedMovieId}
          onClose={() => setSelectedMovieId(null)}
        />
      )}
    </div>
  );
}
