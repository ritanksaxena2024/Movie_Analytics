import { Download } from 'lucide-react';

type Movie = {
  id: number;
  title: string;
  year: string | null;
  rating: number;
  poster: string | null;
  overview: string;
};

interface DownloadCSVProps {
  movies: Movie[];
  filename: string;
  className?: string;
}

const DownloadCSV: React.FC<DownloadCSVProps> = ({ movies, filename, className = "" }) => {
  const convertToCSV = (data: Movie[]): string => {
    if (data.length === 0) return '';
    
    // CSV headers
    const headers = ['ID', 'Title', 'Year', 'Rating', 'Poster URL', 'Overview'];
    
    // Convert movies to CSV rows
    const csvRows = data.map(movie => [
      movie.id.toString(),
      `"${movie.title.replace(/"/g, '""')}"`, // Escape quotes in title
      movie.year || 'N/A',
      movie.rating.toString(),
      movie.poster || 'N/A',
      `"${movie.overview.replace(/"/g, '""')}"` // Escape quotes in overview
    ]);
    
    // Combine headers and rows
    const csvContent = [headers, ...csvRows]
      .map(row => row.join(','))
      .join('\n');
    
    return csvContent;
  };

  const downloadCSV = () => {
    if (movies.length === 0) {
      alert('No movies available to download');
      return;
    }

    const csvContent = convertToCSV(movies);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <button
      onClick={downloadCSV}
      className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200 hover:bg-gray-800 rounded-md ${className}`}
      title={`Download ${filename} CSV`}
    >
      <Download size={16} />
      CSV
    </button>
  );
};

export default DownloadCSV;