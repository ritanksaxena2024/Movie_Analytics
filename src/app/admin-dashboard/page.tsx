"use client";

import React, { useEffect, useState } from "react";
import { Bar, Doughnut, Line, Scatter } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement
);

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
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/dashboard-stats");
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Loading Cinema Analytics</h2>
          <p className="text-[var(--text-secondary)]">Crunching movie data...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-[var(--primary)] rounded-full flex items-center justify-center">
            <span className="text-2xl text-white">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Data Load Failed</h2>
          <p className="text-[var(--text-secondary)]">Unable to fetch movie analytics</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[var(--primary)] text-white rounded-lg hover:opacity-80 transition-opacity"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: 'var(--text-primary)',
          font: { size: 14 },
          padding: 20,
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: 'var(--surface)',
        titleColor: 'var(--text-primary)',
        bodyColor: 'var(--text-primary)',
        borderColor: 'var(--primary)',
        borderWidth: 2,
        cornerRadius: 8,
        displayColors: true,
        titleFont: { size: 14 },
        bodyFont: { size: 13 }
      }
    },
    scales: {
      x: {
        ticks: { 
          color: 'var(--text-secondary)', 
          font: { size: 12 },
          maxRotation: 45
        },
        grid: { 
          color: 'var(--text-disabled)',
          lineWidth: 1
        },
        border: { color: 'var(--text-disabled)' }
      },
      y: {
        ticks: { 
          color: 'var(--text-secondary)',
          font: { size: 12 }
        },
        grid: { 
          color: 'var(--text-disabled)',
          lineWidth: 1
        },
        border: { color: 'var(--text-disabled)' }
      }
    }
  };

  // Calculate total movies properly - sum all genre counts since each movie can have multiple genres
  const totalMovies = stats.genreDistribution.reduce((sum, genre) => {
    const count = typeof genre.count === 'string' ? parseInt(genre.count) : genre.count;
    return sum + (count || 0);
  }, 0);
  
  const topGenre = stats.genreDistribution.reduce((prev, current) => {
    const prevCount = typeof prev.count === 'string' ? parseInt(prev.count) : prev.count;
    const currentCount = typeof current.count === 'string' ? parseInt(current.count) : current.count;
    return (prevCount || 0) > (currentCount || 0) ? prev : current;
  });
  
  const avgRating = stats.avgRatingsPerGenre.length > 0 ? 
    (stats.avgRatingsPerGenre.reduce((sum, genre) => {
      const rating = typeof genre.avg_rating === 'string' ? parseFloat(genre.avg_rating) : genre.avg_rating;
      return sum + (rating || 0);
    }, 0) / stats.avgRatingsPerGenre.length).toFixed(1) : '0.0';

  console.log('Debug data:', {
    genreDistribution: stats.genreDistribution,
    totalMovies,
    firstGenre: stats.genreDistribution[0],
    firstActor: stats.topActors[0]
  });

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Page Title */}
        <div className="text-center mb-8 mt-16">
          <p className="text-[var(--text-secondary)] text-lg">
            🎬 Movie Analytics Dashboard
          </p>
        </div>

        {/* Navigation Tabs - Inside Content */}
        <div className="bg-[var(--surface)] rounded-xl border border-[var(--overlay)] mb-8">
          <div className="flex space-x-1 p-2">
            {[
              { id: 'overview', label: '📊 Overview' },
              { id: 'genres', label: '🎭 Genres' },
              { id: 'trends', label: '📈 Trends' },
              { id: 'people', label: '👥 People' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id 
                    ? 'bg-[var(--primary)] text-white shadow-md' 
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--overlay)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-[var(--surface)] rounded-xl p-6 border border-[var(--overlay)] hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[var(--text-secondary)] text-sm font-medium">Total Movies</p>
                    <p className="text-3xl font-bold text-[var(--text-primary)]">{totalMovies.toLocaleString()}</p>
                    <p className="text-xs text-[var(--text-disabled)] mt-1">Across all genres</p>
                  </div>
                  <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🎬</span>
                  </div>
                </div>
              </div>

              <div className="bg-[var(--surface)] rounded-xl p-6 border border-[var(--overlay)] hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[var(--text-secondary)] text-sm font-medium">Average Rating</p>
                    <p className="text-3xl font-bold text-[var(--text-primary)]">{avgRating}</p>
                    <p className="text-xs text-[var(--text-disabled)] mt-1">Out of 10</p>
                  </div>
                  <div className="w-12 h-12 bg-[var(--secondary)]/10 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">⭐</span>
                  </div>
                </div>
              </div>

              <div className="bg-[var(--surface)] rounded-xl p-6 border border-[var(--overlay)] hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[var(--text-secondary)] text-sm font-medium">Top Genre</p>
                    <p className="text-2xl font-bold text-[var(--text-primary)]">{topGenre.genre}</p>
                    <p className="text-xs text-[var(--text-disabled)] mt-1">
                      {typeof topGenre.count === 'string' ? parseInt(topGenre.count) : topGenre.count} movies
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-[var(--highlight)]/10 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🏆</span>
                  </div>
                </div>
              </div>

              <div className="bg-[var(--surface)] rounded-xl p-6 border border-[var(--overlay)] hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[var(--text-secondary)] text-sm font-medium">Years Covered</p>
                    <p className="text-2xl font-bold text-[var(--text-primary)]">
                      {Math.max(...stats.avgRuntimePerYear.map(r => r.year)) - Math.min(...stats.avgRuntimePerYear.map(r => r.year)) + 1}
                    </p>
                    <p className="text-xs text-[var(--text-disabled)] mt-1">
                      {Math.min(...stats.avgRuntimePerYear.map(r => r.year))} - {Math.max(...stats.avgRuntimePerYear.map(r => r.year))}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📅</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Genre Distribution */}
              <div className="bg-[var(--surface)] rounded-xl p-6 border border-[var(--overlay)]">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-[var(--text-primary)]">Movie Distribution by Genre</h3>
                  <span className="text-sm text-[var(--text-secondary)] bg-[var(--overlay)] px-3 py-1 rounded-full">
                    {stats.genreDistribution.length} genres
                  </span>
                </div>
                <div className="h-80">
                  <Doughnut
                    data={{
                      labels: stats.genreDistribution.map(g => {
                        const count = typeof g.count === 'string' ? parseInt(g.count) : g.count;
                        return `${g.genre} (${count})`;
                      }),
                      datasets: [{
                        data: stats.genreDistribution.map(g => {
                          const count = typeof g.count === 'string' ? parseInt(g.count) : g.count;
                          return count || 0;
                        }),
                        backgroundColor: [
                          'var(--primary)', 'var(--secondary)', 'var(--highlight)', 
                          '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
                          '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE'
                        ],
                        borderColor: 'var(--background)',
                        borderWidth: 3,
                        hoverBorderWidth: 4,
                      }]
                    }}
                    options={{
                      ...chartOptions,
                      cutout: '60%',
                      plugins: {
                        ...chartOptions.plugins,
                        legend: {
                          position: 'right' as const,
                          labels: { 
                            color: 'var(--text-primary)', 
                            usePointStyle: true, 
                            padding: 15,
                            font: { size: 12 }
                          }
                        },
                        tooltip: {
                          ...chartOptions.plugins?.tooltip,
                          callbacks: {
                            label: function(context) {
                              const label = context.label || '';
                              const percentage = ((context.parsed / totalMovies) * 100).toFixed(1);
                              return `${label}: ${percentage}%`;
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Average Ratings */}
              <div className="bg-[var(--surface)] rounded-xl p-6 border border-[var(--overlay)]">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-[var(--text-primary)]">Average Ratings by Genre</h3>
                  <span className="text-sm text-[var(--text-secondary)] bg-[var(--overlay)] px-3 py-1 rounded-full">
                    0-10 scale
                  </span>
                </div>
                <div className="h-80">
                  <Bar
                    data={{
                      labels: stats.avgRatingsPerGenre.map(r => r.genre),
                      datasets: [{
                        label: 'Average Rating',
                        data: stats.avgRatingsPerGenre.map(r => Number(r.avg_rating.toFixed(1))),
                        backgroundColor: stats.avgRatingsPerGenre.map((_, i) => 
                          i % 3 === 0 ? 'var(--primary)' : i % 3 === 1 ? 'var(--secondary)' : 'var(--highlight)'
                        ),
                        borderColor: 'var(--background)',
                        borderWidth: 2,
                        borderRadius: 6,
                      }]
                    }}
                    options={{
                      ...chartOptions,
                      plugins: { ...chartOptions.plugins, legend: { display: false } },
                      scales: {
                        ...chartOptions.scales,
                        y: {
                          ...chartOptions.scales?.y,
                          beginAtZero: true,
                          max: 10,
                          ticks: {
                            ...chartOptions.scales?.y?.ticks,
                            callback: function(value) {
                              return value + '/10';
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Genres Tab */}
        {activeTab === 'genres' && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Genre Analysis</h2>
              <p className="text-[var(--text-secondary)]">Detailed breakdown of movie genres and their performance</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Genre Count Chart */}
              <div className="lg:col-span-2 bg-[var(--surface)] rounded-xl p-6 border border-[var(--overlay)]">
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6">Movies per Genre</h3>
                <div className="h-96">
                  <Bar
                    data={{
                      labels: stats.genreDistribution.map(g => g.genre),
                      datasets: [{
                        label: 'Number of Movies',
                        data: stats.genreDistribution.map(g => Number(g.count || 0)),
                        backgroundColor: 'var(--primary)',
                        borderColor: 'var(--primary)',
                        borderWidth: 2,
                        borderRadius: 8,
                      }]
                    }}
                    options={{
                      ...chartOptions,
                      plugins: { ...chartOptions.plugins, legend: { display: false } },
                      scales: {
                        ...chartOptions.scales,
                        x: {
                          ...chartOptions.scales?.x,
                          ticks: {
                            ...chartOptions.scales?.x?.ticks,
                            maxRotation: 45,
                            minRotation: 45
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Genre Rankings */}
              <div className="bg-[var(--surface)] rounded-xl p-6 border border-[var(--overlay)]">
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6">Genre Rankings</h3>
                <div className="space-y-3">
                  {stats.genreDistribution
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 8)
                    .map((genre, index) => (
                      <div key={genre.genre} className="flex items-center justify-between p-3 bg-[var(--overlay)] rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 bg-[var(--primary)] text-white text-xs font-bold rounded-full flex items-center justify-center">
                            {index + 1}
                          </span>
                          <span className="font-medium text-[var(--text-primary)]">{genre.genre}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-[var(--text-primary)]">{genre.count}</div>
                          <div className="text-xs text-[var(--text-secondary)]">
                            {((genre.count / totalMovies) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trends Tab */}
        {activeTab === 'trends' && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Movie Trends Over Time</h2>
              <p className="text-[var(--text-secondary)]">How movie characteristics have evolved through the years</p>
            </div>

            <div className="bg-[var(--surface)] rounded-xl p-6 border border-[var(--overlay)]">
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6">Average Runtime Evolution</h3>
              <div className="h-96">
                <Line
                  data={{
                    labels: stats.avgRuntimePerYear.map(r => r.year.toString()),
                    datasets: [{
                      label: 'Average Runtime (minutes)',
                      data: stats.avgRuntimePerYear.map(r => Math.round(r.avg_runtime)),
                      borderColor: 'var(--highlight)',
                      backgroundColor: 'var(--highlight)',
                      borderWidth: 3,
                      fill: false,
                      tension: 0.4,
                      pointBackgroundColor: 'var(--highlight)',
                      pointBorderColor: 'var(--background)',
                      pointBorderWidth: 2,
                      pointRadius: 6,
                      pointHoverRadius: 8,
                    }]
                  }}
                  options={{
                    ...chartOptions,
                    plugins: { 
                      ...chartOptions.plugins, 
                      legend: { display: false },
                      tooltip: {
                        ...chartOptions.plugins?.tooltip,
                        callbacks: {
                          label: function(context) {
                            return `${context.parsed.y} minutes`;
                          }
                        }
                      }
                    },
                    scales: {
                      ...chartOptions.scales,
                      y: {
                        ...chartOptions.scales?.y,
                        ticks: {
                          ...chartOptions.scales?.y?.ticks,
                          callback: function(value) {
                            return value + ' min';
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
              <div className="mt-4 p-4 bg-[var(--overlay)] rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-[var(--text-primary)]">
                      {Math.min(...stats.avgRuntimePerYear.map(r => Math.round(r.avg_runtime)))} min
                    </div>
                    <div className="text-sm text-[var(--text-secondary)]">Shortest Average</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[var(--text-primary)]">
                      {Math.max(...stats.avgRuntimePerYear.map(r => Math.round(r.avg_runtime)))} min
                    </div>
                    <div className="text-sm text-[var(--text-secondary)]">Longest Average</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[var(--text-primary)]">
                      {Math.round(stats.avgRuntimePerYear.reduce((sum, r) => sum + r.avg_runtime, 0) / stats.avgRuntimePerYear.length)} min
                    </div>
                    <div className="text-sm text-[var(--text-secondary)]">Overall Average</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* People Tab */}
        {activeTab === 'people' && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Top Contributors</h2>
              <p className="text-[var(--text-secondary)]">Most prolific actors and directors in our database</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Top Actors */}
              <div className="bg-[var(--surface)] rounded-xl p-6 border border-[var(--overlay)]">
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6">Top Actors by Movie Count</h3>
                <div className="h-80">
                  <Bar
                    data={{
                      labels: stats.topActors.slice(0, 10).map(a => a.actor.length > 15 ? a.actor.substring(0, 15) + '...' : a.actor),
                      datasets: [{
                        label: 'Movies',
                        data: stats.topActors.slice(0, 10).map(a => a.count),
                        backgroundColor: 'var(--secondary)',
                        borderColor: 'var(--secondary)',
                        borderWidth: 2,
                        borderRadius: 6,
                      }]
                    }}
                    options={{
                      ...chartOptions,
                      plugins: { ...chartOptions.plugins, legend: { display: false } },
                      indexAxis: 'y' as const,
                    }}
                  />
                </div>
              </div>

              {/* Top Directors */}
              <div className="bg-[var(--surface)] rounded-xl p-6 border border-[var(--overlay)]">
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6">Top Directors by Movie Count</h3>
                <div className="h-80">
                  <Bar
                    data={{
                      labels: stats.topDirectors.slice(0, 10).map(d => d.director.length > 15 ? d.director.substring(0, 15) + '...' : d.director),
                      datasets: [{
                        label: 'Movies',
                        data: stats.topDirectors.slice(0, 10).map(d => d.count),
                        backgroundColor: 'var(--highlight)',
                        borderColor: 'var(--highlight)',
                        borderWidth: 2,
                        borderRadius: 6,
                      }]
                    }}
                    options={{
                      ...chartOptions,
                      plugins: { ...chartOptions.plugins, legend: { display: false } },
                      indexAxis: 'y' as const,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* People Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-[var(--surface)] rounded-xl p-6 border border-[var(--overlay)]">
                <h4 className="text-lg font-bold text-[var(--text-primary)] mb-4">Actor Leaderboard</h4>
                <div className="space-y-2">
                  {stats.topActors.slice(0, 5).map((actor, index) => (
                    <div key={actor.actor} className="flex items-center justify-between p-2 hover:bg-[var(--overlay)] rounded-lg transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 bg-[var(--secondary)] text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="font-medium text-[var(--text-primary)]">{actor.actor}</span>
                      </div>
                      <span className="font-bold text-[var(--text-primary)]">{actor.count} movies</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[var(--surface)] rounded-xl p-6 border border-[var(--overlay)]">
                <h4 className="text-lg font-bold text-[var(--text-primary)] mb-4">Director Leaderboard</h4>
                <div className="space-y-2">
                  {stats.topDirectors.slice(0, 5).map((director, index) => (
                    <div key={director.director} className="flex items-center justify-between p-2 hover:bg-[var(--overlay)] rounded-lg transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 bg-[var(--highlight)] text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="font-medium text-[var(--text-primary)]">{director.director}</span>
                      </div>
                      <span className="font-bold text-[var(--text-primary)]">{director.count} movies</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}