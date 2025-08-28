import DownloadCSV from "./DownloadCsv";

type Movie = {
  id: number;
  title: string;
  year: string | null;
  rating: number;
  poster: string | null;
  overview: string;
};

interface MovieCarouselProps {
  movies: Movie[];
  title: string;
  onCardClick: (id: number) => void;
  downloadFilename?: string; // Optional download filename
}

const MovieCarousel: React.FC<MovieCarouselProps> = ({ 
  movies, 
  title, 
  onCardClick, 
  downloadFilename 
}) => {
  return (
    <div className="mb-8">
      {/* Header with title and download button */}
      <div className="flex items-center justify-between px-6 mb-4">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        {downloadFilename && (
          <DownloadCSV 
            movies={movies} 
            filename={downloadFilename}
            className="ml-4"
          />
        )}
      </div>
      
      {/* Your existing carousel content here */}
      <div className="overflow-x-auto">
        <div className="flex gap-4 px-6">
          {movies.map((movie) => (
            <div
              key={movie.id}
              className="flex-shrink-0 cursor-pointer"
              onClick={() => onCardClick(movie.id)}
            >
              {/* Your existing movie card content */}
              <div className="w-48 bg-gray-800 rounded-lg overflow-hidden">
                {movie.poster && (
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-full h-72 object-cover"
                  />
                )}
                <div className="p-3">
                  <h3 className="text-white font-medium truncate">{movie.title}</h3>
                  <p className="text-gray-400 text-sm">{movie.year}</p>
                  <p className="text-yellow-400 text-sm">★ {movie.rating}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MovieCarousel;