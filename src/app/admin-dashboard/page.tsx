"use client";

import React, { useEffect, useState } from "react";
import { Star, Film, Clock, Users, Award, TrendingUp, Calendar, Play } from "lucide-react";

// Types for API response
interface GenreDist {
  genre: string;
  count: number;
}

interface AvgRating {
  genre: string;
  avg_rating: number;
}

interface RuntimeYear {
  year: number;
  avg_runtime: number;
}

interface ActorStat {
  actor: string;
  count: number;
}

interface DirectorStat {
  director: string;
  count: number;
}

interface StatsResponse {
  genreDistribution: GenreDist[];
  avgRatingsPerGenre: AvgRating[];
  avgRuntimePerYear: RuntimeYear[];
  topActors: ActorStat[];
  topDirectors: DirectorStat[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    // Simulate API call with sample data
    setTimeout(() => {
      const sampleData: StatsResponse = {
        genreDistribution: [
          { genre: "Action", count: 1250 },
          { genre: "Drama", count: 980 },
          { genre: "Comedy", count: 875 },
          { genre: "Thriller", count: 654 },
          { genre: "Romance", count: 543 },
          { genre: "Sci-Fi", count: 432 },
          { genre: "Horror", count: 321 },
          { genre: "Adventure", count: 298 }
        ],
        avgRatingsPerGenre: [
          { genre: "Drama", avg_rating: 8.2 },
          { genre: "Thriller", avg_rating: 7.9 },
          { genre: "Action", avg_rating: 7.1 },
          { genre: "Comedy", avg_rating: 6.8 },
          { genre: "Sci-Fi", avg_rating: 7.5 },
          { genre: "Romance", avg_rating: 6.9 },
          { genre: "Horror", avg_rating: 6.3 },
          { genre: "Adventure", avg_rating: 7.2 }
        ],
        avgRuntimePerYear: [
          { year: 2020, avg_runtime: 118 },
          { year: 2021, avg_runtime: 122 },
          { year: 2022, avg_runtime: 125 },
          { year: 2023, avg_runtime: 128 },
          { year: 2024, avg_runtime: 131 }
        ],
        topActors: [
          { actor: "Robert Downey Jr.", count: 42 },
          { actor: "Scarlett Johansson", count: 38 },
          { actor: "Chris Evans", count: 35 },
          { actor: "Tom Hanks", count: 33 },
          { actor: "Leonardo DiCaprio", count: 31 }
        ],
        topDirectors: [
          { director: "Christopher Nolan", count: 18 },
          { director: "Steven Spielberg", count: 16 },
          { director: "Martin Scorsese", count: 14 },
          { director: "Quentin Tarantino", count: 12 },
          { director: "Denis Villeneuve", count: 10 }
        ]
      };
      setStats(sampleData);
      setLoading(false);
    }, 1500);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <Film className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-purple-400 w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-white">Loading Cinema Universe</h2>
          <p className="text-purple-300">Preparing your movie analytics...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-3xl text-white">⚠️</span>
          </div>
          <h2 className="text-3xl font-bold text-white">Connection Lost</h2>
          <p className="text-red-300">Unable to load movie data</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-all transform hover:scale-105"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const totalMovies = stats.genreDistribution.reduce((sum, genre) => sum + genre.count, 0);
  const topGenre = stats.genreDistribution.reduce((prev, current) => prev.count > current.count ? prev : current);
  const avgRating = (stats.avgRatingsPerGenre.reduce((sum, genre) => sum + genre.avg_rating, 0) / stats.avgRatingsPerGenre.length).toFixed(1);

  const genreColors = {
    "Action": "from-red-500 to-orange-500",
    "Drama": "from-blue-500 to-purple-500",
    "Comedy": "from-yellow-500 to-orange-500",
    "Thriller": "from-gray-700 to-gray-900",
    "Romance": "from-pink-500 to-red-500",
    "Sci-Fi": "from-cyan-500 to-blue-500",
    "Horror": "from-purple-800 to-red-800",
    "Adventure": "from-green-500 to-teal-500"
  };

  const genreIcons = {
    "Action": "💥",
    "Drama": "🎭",
    "Comedy": "😄",
    "Thriller": "🔪",
    "Romance": "💕",
    "Sci-Fi": "🚀",
    "Horror": "👻",
    "Adventure": "🗺️"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
          <div className="text-center">
            <div className="flex justify-center mb-6 mt-9">
              <div className="relative">
                <Film className="w-12 h-12 sm:w-16 sm:h-16 text-purple-400" />
                <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Star className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Cinema Analytics Hub
            </h1>
            <p className="text-lg sm:text-xl text-purple-200 max-w-2xl mx-auto px-4">
              Explore the fascinating world of movies through data, insights, and trends
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Responsive Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2">
          {/* Desktop Navigation */}
          <div className="hidden sm:flex space-x-2">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'genres', label: 'Genres', icon: Film },
              { id: 'people', label: 'Contributors', icon: Users },
              { id: 'trends', label: 'Timeline', icon: Calendar }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-xl text-sm font-semibold transition-all ${
                  activeSection === tab.id 
                    ? 'bg-white text-purple-900 shadow-lg' 
                    : 'text-white hover:bg-white/20'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Mobile Navigation - Grid Layout */}
          <div className="grid grid-cols-2 gap-2 sm:hidden">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'genres', label: 'Genres', icon: Film },
              { id: 'people', label: 'Contributors', icon: Users },
              { id: 'trends', label: 'Timeline', icon: Calendar }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`flex flex-col items-center justify-center gap-1 py-3 px-4 rounded-xl text-xs font-semibold transition-all ${
                  activeSection === tab.id 
                    ? 'bg-white text-purple-900 shadow-lg' 
                    : 'text-white hover:bg-white/20'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="text-center leading-tight">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        {/* Overview Section */}
        {activeSection === 'overview' && (
          <div className="space-y-8">
            {/* Hero Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-4 sm:p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="relative">
                  <Film className="w-6 h-6 sm:w-8 sm:h-8 mb-4 opacity-80" />
                  <p className="text-purple-100 text-xs sm:text-sm font-medium">Total Movies</p>
                  <p className="text-2xl sm:text-4xl font-bold">{totalMovies.toLocaleString()}</p>
                  <p className="text-purple-200 text-xs mt-2">Across all platforms</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-4 sm:p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="relative">
                  <Star className="w-6 h-6 sm:w-8 sm:h-8 mb-4 opacity-80" />
                  <p className="text-yellow-100 text-xs sm:text-sm font-medium">Average Rating</p>
                  <p className="text-2xl sm:text-4xl font-bold">{avgRating}</p>
                  <p className="text-yellow-200 text-xs mt-2">Out of 10 stars</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl p-4 sm:p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="relative">
                  <Award className="w-6 h-6 sm:w-8 sm:h-8 mb-4 opacity-80" />
                  <p className="text-green-100 text-xs sm:text-sm font-medium">Top Genre</p>
                  <p className="text-lg sm:text-2xl font-bold">{topGenre.genre}</p>
                  <p className="text-green-200 text-xs mt-2">{topGenre.count.toLocaleString()} movies</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-pink-500 to-red-500 rounded-2xl p-4 sm:p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="relative">
                  <Clock className="w-6 h-6 sm:w-8 sm:h-8 mb-4 opacity-80" />
                  <p className="text-pink-100 text-xs sm:text-sm font-medium">Avg Runtime</p>
                  <p className="text-2xl sm:text-4xl font-bold">
                    {Math.round(stats.avgRuntimePerYear.reduce((sum, r) => sum + r.avg_runtime, 0) / stats.avgRuntimePerYear.length)}
                  </p>
                  <p className="text-pink-200 text-xs mt-2">Minutes per movie</p>
                </div>
              </div>
            </div>

            {/* Featured Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Genre Showcase */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Film className="w-5 h-5 sm:w-6 sm:h-6" />
                  Genre Universe
                </h3>
                <div className="space-y-4">
                  {stats.genreDistribution.slice(0, 6).map((genre, index) => {
                    const percentage = (genre.count / totalMovies) * 100;
                    return (
                      <div key={genre.genre} className="relative">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="text-xl sm:text-2xl">{genreIcons[genre.genre as keyof typeof genreIcons] || "🎬"}</span>
                            <span className="text-white font-semibold text-sm sm:text-base">{genre.genre}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-white font-bold text-sm sm:text-base">{genre.count.toLocaleString()}</span>
                            <span className="text-purple-300 text-xs sm:text-sm ml-2">{percentage.toFixed(1)}%</span>
                          </div>
                        </div>
                        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                          <div 
                            className={`h-full bg-gradient-to-r ${genreColors[genre.genre as keyof typeof genreColors] || 'from-purple-500 to-blue-500'} rounded-full transition-all duration-1000 ease-out`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top Performers */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                  Hall of Fame
                </h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-base sm:text-lg font-semibold text-purple-300 mb-3">🎭 Top Actors</h4>
                    <div className="space-y-2">
                      {stats.topActors.slice(0, 3).map((actor, index) => (
                        <div key={actor.actor} className="flex items-center gap-3 sm:gap-4 p-2 sm:p-3 bg-white/5 rounded-lg">
                          <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm ${
                            index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium text-sm sm:text-base truncate">{actor.actor}</p>
                            <p className="text-purple-300 text-xs sm:text-sm">{actor.count} movies</p>
                          </div>
                          <div className="flex">
                            {[...Array(Math.min(5, Math.floor(actor.count / 10)))].map((_, i) => (
                              <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-base sm:text-lg font-semibold text-purple-300 mb-3">🎬 Top Directors</h4>
                    <div className="space-y-2">
                      {stats.topDirectors.slice(0, 3).map((director, index) => (
                        <div key={director.director} className="flex items-center gap-3 sm:gap-4 p-2 sm:p-3 bg-white/5 rounded-lg">
                          <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm ${
                            index === 0 ? 'bg-purple-500' : index === 1 ? 'bg-blue-500' : 'bg-teal-500'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium text-sm sm:text-base truncate">{director.director}</p>
                            <p className="text-purple-300 text-xs sm:text-sm">{director.count} movies</p>
                          </div>
                          <Play className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Genres Section */}
        {activeSection === 'genres' && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Genre Deep Dive</h2>
              <p className="text-purple-200 text-lg">Explore the diverse world of movie genres</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {stats.genreDistribution.map((genre, index) => {
                const rating = stats.avgRatingsPerGenre.find(r => r.genre === genre.genre);
                const percentage = (genre.count / totalMovies) * 100;
                
                return (
                  <div key={genre.genre} className={`bg-gradient-to-br ${genreColors[genre.genre as keyof typeof genreColors] || 'from-purple-500 to-blue-500'} rounded-2xl p-4 sm:p-6 text-white transform hover:scale-105 transition-all duration-300 cursor-pointer`}>
                    <div className="text-center">
                      <div className="text-2xl sm:text-4xl mb-3">{genreIcons[genre.genre as keyof typeof genreIcons] || "🎬"}</div>
                      <h3 className="text-lg sm:text-xl font-bold mb-2">{genre.genre}</h3>
                      <div className="space-y-2">
                        <div className="bg-white/20 rounded-full p-2">
                          <p className="text-xl sm:text-2xl font-bold">{genre.count.toLocaleString()}</p>
                          <p className="text-xs sm:text-sm opacity-80">Movies</p>
                        </div>
                        <div className="flex justify-between items-center text-xs sm:text-sm">
                          <span>{percentage.toFixed(1)}% of total</span>
                          {rating && (
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
                              <span>{rating.avg_rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Rating Showcase */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 text-center">Genre Rating Excellence</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.avgRatingsPerGenre
                  .sort((a, b) => b.avg_rating - a.avg_rating)
                  .slice(0, 4)
                  .map((genre, index) => (
                    <div key={genre.genre} className="text-center p-4 bg-white/5 rounded-xl">
                      <div className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 rounded-full flex items-center justify-center text-xl sm:text-2xl ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 
                        index === 2 ? 'bg-orange-500' : 'bg-purple-500'
                      }`}>
                        {genreIcons[genre.genre as keyof typeof genreIcons] || "🎬"}
                      </div>
                      <h4 className="text-white font-bold text-sm sm:text-base">{genre.genre}</h4>
                      <div className="flex items-center justify-center gap-1 mt-2">
                        <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" />
                        <span className="text-white font-bold text-base sm:text-lg">{genre.avg_rating.toFixed(1)}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* People Section */}
        {activeSection === 'people' && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Cinema Legends</h2>
              <p className="text-purple-200 text-lg">Celebrating the most prolific contributors to cinema</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Top Actors */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-xl sm:text-2xl">🎭</span>
                  Leading Performers
                </h3>
                <div className="space-y-4">
                  {stats.topActors.slice(0, 8).map((actor, index) => (
                    <div key={actor.actor} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base ${
                        index < 3 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gradient-to-r from-purple-500 to-blue-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-bold text-base sm:text-lg truncate">{actor.actor}</h4>
                        <p className="text-purple-300 text-sm sm:text-base">{actor.count} movie appearances</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 mb-1">
                          {[...Array(Math.min(5, Math.ceil(actor.count / 10)))].map((_, i) => (
                            <Star key={i} className="w-2 h-2 sm:w-3 sm:h-3 text-yellow-400 fill-current" />
                          ))}
                        </div>
                        <span className="text-purple-300 text-xs sm:text-sm">Excellence Rating</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Directors */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-xl sm:text-2xl">🎬</span>
                  Visionary Directors
                </h3>
                <div className="space-y-4">
                  {stats.topDirectors.slice(0, 8).map((director, index) => (
                    <div key={director.director} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base ${
                        index < 3 ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gradient-to-r from-teal-500 to-blue-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-bold text-base sm:text-lg truncate">{director.director}</h4>
                        <p className="text-purple-300 text-sm sm:text-base">{director.count} films directed</p>
                      </div>
                      <div className="text-right">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                          <Award className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Timeline Section */}
        {activeSection === 'trends' && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Cinema Evolution</h2>
              <p className="text-purple-200 text-lg">How movies have evolved over the years</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-8 text-center flex items-center justify-center gap-3">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
                Runtime Evolution Timeline
              </h3>
              
              <div className="relative">
                <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></div>
                
                <div className="space-y-6 sm:space-y-8">
                  {stats.avgRuntimePerYear.map((yearData, index) => (
                    <div key={yearData.year} className={`flex items-center ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                      <div className={`bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 w-full max-w-xs sm:max-w-sm relative ${
                        index % 2 === 0 ? 'mr-auto' : 'ml-auto'
                      }`}>
                        <div className={`absolute top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full ${
                          index % 2 === 0 ? '-right-6 sm:-right-8' : '-left-6 sm:-left-8'
                        }`}></div>
                        
                        <div className="text-center">
                          <h4 className="text-xl sm:text-2xl font-bold text-white mb-2">{yearData.year}</h4>
                          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-3 sm:p-4 mb-3">
                            <div className="flex items-center justify-center gap-2">
                              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                              <span className="text-xl sm:text-2xl font-bold text-white">{Math.round(yearData.avg_runtime)}</span>
                              <span className="text-purple-200 text-sm sm:text-base">min</span>
                            </div>
                          </div>
                          <p className="text-purple-300 text-xs sm:text-sm">Average movie length</p>
                          
                          {/* Progress indicator */}
                          <div className="mt-4 bg-white/20 rounded-full h-2 overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                              style={{ width: `${(yearData.avg_runtime / 150) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-xl sm:text-2xl font-bold text-white">
                      {Math.min(...stats.avgRuntimePerYear.map(r => Math.round(r.avg_runtime)))} min
                    </p>
                    <p className="text-purple-300 text-xs sm:text-sm">Shortest Average</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-xl sm:text-2xl font-bold text-white">
                      {Math.max(...stats.avgRuntimePerYear.map(r => Math.round(r.avg_runtime)))} min
                    </p>
                    <p className="text-purple-300 text-xs sm:text-sm">Longest Average</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-xl sm:text-2xl font-bold text-white">
                      {Math.round(stats.avgRuntimePerYear.reduce((sum, r) => sum + r.avg_runtime, 0) / stats.avgRuntimePerYear.length)} min
                    </p>
                    <p className="text-purple-300 text-xs sm:text-sm">Overall Average</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trend Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <div className="bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl p-6 sm:p-8 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8" />
                  <h3 className="text-xl sm:text-2xl font-bold">Runtime Trend</h3>
                </div>
                <p className="text-green-100 mb-4 text-sm sm:text-base">
                  Movies are getting longer! The average runtime has increased by{' '}
                  <span className="font-bold">
                    {Math.round(stats.avgRuntimePerYear[stats.avgRuntimePerYear.length - 1].avg_runtime - stats.avgRuntimePerYear[0].avg_runtime)} minutes
                  </span>{' '}
                  over the past {stats.avgRuntimePerYear.length} years.
                </p>
                <div className="bg-white/20 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm sm:text-base">Growth Rate</span>
                    <span className="text-xl sm:text-2xl font-bold">+{(((stats.avgRuntimePerYear[stats.avgRuntimePerYear.length - 1].avg_runtime / stats.avgRuntimePerYear[0].avg_runtime) - 1) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl p-6 sm:p-8 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="w-6 h-6 sm:w-8 sm:h-8" />
                  <h3 className="text-xl sm:text-2xl font-bold">Timeline Insights</h3>
                </div>
                <p className="text-blue-100 mb-4 text-sm sm:text-base">
                  Our database spans {stats.avgRuntimePerYear.length} years of cinema history, from{' '}
                  <span className="font-bold">{Math.min(...stats.avgRuntimePerYear.map(r => r.year))}</span> to{' '}
                  <span className="font-bold">{Math.max(...stats.avgRuntimePerYear.map(r => r.year))}</span>.
                </p>
                <div className="bg-white/20 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm sm:text-base">Peak Year</span>
                    <span className="text-xl sm:text-2xl font-bold">
                      {stats.avgRuntimePerYear.reduce((prev, current) => 
                        prev.avg_runtime > current.avg_runtime ? prev : current
                      ).year}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>


    </div>
  );
}