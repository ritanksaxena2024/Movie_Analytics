"use client";
import { useState, useRef, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { useTheme } from "../Layout";
import SearchMovieModal from "./MovieSearchModal";
import { useRouter, usePathname } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    { id: number; imdb_id: string; title: string; year?: number }[]
  >([]);
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);

  const routeToLoginOrLogout = () => {
    if (pathname === "/admin-dashboard") {
      // Perform logout logic
      // For example, remove token cookie and redirect
      document.cookie = "token=; Max-Age=0; path=/";
      router.push("/admin-login");
    } else {
      router.push("/admin-login");
    }
  };

  // Debounce
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 300);
  }, [searchQuery]);

  // Fetch results
  useEffect(() => {
    if (!debouncedQuery) return;
    const fetchResults = async () => {
      try {
        const res = await fetch(`/api/get-movies?search=${debouncedQuery}`);
        const data = await res.json();
        setSearchResults(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchResults();
  }, [debouncedQuery]);

  const handleMovieSelect = (id: number) => {
    setSelectedMovieId(id);
    setSearchResults([]);
    setSearchQuery("");
    setShowMobileSearch(false);
  };

  // Desktop outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowMobileSearch(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header className="absolute top-0 left-0 w-full z-20 flex items-center justify-end px-6 py-4 border-b border-[var(--overlay)] gap-3">
        {/* Desktop Search */}
        <div
          ref={searchContainerRef}
          className="hidden md:flex items-center relative group"
        >
          <button className="px-3 py-2 bg-[var(--surface)] border border-[var(--overlay)] rounded-l text-[var(--text-primary)] flex items-center justify-center">
            <FaSearch />
          </button>
          <input
            type="text"
            placeholder="Search movies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-0 group-hover:w-64 transition-all duration-300 ease-in-out px-3 py-2 rounded-r bg-[var(--surface)] text-[var(--text-primary)] border border-l-0 border-[var(--overlay)] focus:outline-none"
          />
          {searchQuery && searchResults.length > 0 && (
            <div className="absolute top-full left-0 w-64 bg-[var(--surface)] border border-[var(--overlay)] mt-1 max-h-64 overflow-y-auto rounded shadow-lg z-50">
              {searchResults.map((movie) => (
                <div
                  key={movie.id}
                  className="px-3 py-2 hover:bg-[var(--highlight)] cursor-pointer text-[var(--text-primary)]"
                  onClick={() => handleMovieSelect(movie.id)}
                >
                  {movie.title} {movie.year ? `(${movie.year})` : ""}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mobile Search */}
        <div className="md:hidden relative">
          <button
            onClick={() => setShowMobileSearch((prev) => !prev)}
            className="px-3 py-2 bg-[var(--surface)] border border-[var(--overlay)] rounded text-[var(--text-primary)] flex items-center justify-center"
          >
            <FaSearch />
          </button>
          {showMobileSearch && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-[var(--surface)] border border-[var(--overlay)] rounded shadow-lg p-2 z-50">
              <input
                type="text"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full px-3 py-2 rounded bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--overlay)] focus:outline-none"
              />
              {searchQuery && searchResults.length > 0 && (
                <div className="mt-2 max-h-64 overflow-y-auto border-t border-[var(--overlay)]">
                  {searchResults.map((movie) => (
                    <div
                      key={movie.id}
                      className="px-3 py-2 hover:bg-[var(--highlight)] cursor-pointer text-[var(--text-primary)]"
                      onClick={() => handleMovieSelect(movie.id)}
                    >
                      {movie.title} {movie.year ? `(${movie.year})` : ""}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <button
          className="px-3 py-2 bg-[var(--primary)] rounded text-[var(--text-primary)] transition"
          onClick={routeToLoginOrLogout}
        >
          {pathname === "/admin-dashboard" ? "Logout" : "Admin Login"}
        </button>

        <button
          onClick={toggleTheme}
          className="px-3 py-2 bg-[var(--surface)] border border-[var(--overlay)] rounded text-[var(--text-primary)] transition"
        >
          {theme === "light" ? "Dark Mode" : "Light Mode"}
        </button>
      </header>

      {/* Movie Modal */}
      {selectedMovieId && (
        <SearchMovieModal
          movieId={selectedMovieId}
          onClose={() => setSelectedMovieId(null)}
        />
      )}
    </>
  );
}
