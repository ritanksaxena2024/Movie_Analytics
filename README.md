# 🎬 MovieFlix Database Schema

## 📖 Overview
The MovieFlix database schema is designed to efficiently store, cache, and manage movie-related data such as metadata, actors, directors, genres, ratings, and user activities.  
It normalizes relationships to avoid redundancy and uses junction tables for many-to-many mappings (e.g., movies ↔ actors, movies ↔ genres).  
This schema also supports **search logging** and **user authentication/roles** for secure access.

---

## 🗄️ Tables and Relationships

### 1. `movies`
Stores metadata of each movie fetched from external APIs.
- **id** (PK) – Unique internal identifier.
- **imdb_id** – Unique external identifier (IMDb).
- **title** – Movie title.
- **year** – Release year.
- **rating** – Numeric rating.
- **runtime** – Duration in minutes.
- **cached_at** – Timestamp when the movie was cached.
- **teaser_url** – Optional trailer/teaser link.

---

### 2. `actors`
List of unique actors.
- **id** (PK)
- **name** (unique)

---

### 3. `directors`
List of unique directors.
- **id** (PK)
- **name** (unique)

---

### 4. `genres`
List of unique genres.
- **id** (PK)
- **name** (unique)

---

### 5. `movie_actors` (junction table)
Links movies with their actors (**many-to-many**).
- **movie_id** (FK → movies.id)
- **actor_id** (FK → actors.id)  
🔑 **Primary Key:** (movie_id, actor_id)

---

### 6. `movie_directors` (junction table)
Links movies with their directors (**many-to-many**).
- **movie_id** (FK → movies.id)
- **director_id** (FK → directors.id)  
🔑 **Primary Key:** (movie_id, director_id)

---

### 7. `movie_genres` (junction table)
Links movies with their genres (**many-to-many**).
- **movie_id** (FK → movies.id)
- **genre_id** (FK → genres.id)  
🔑 **Primary Key:** (movie_id, genre_id)

---

### 8. `users`
Stores user accounts and roles for authentication.
- **id** (PK)
- **username** (unique)
- **email** (unique)
- **password_hash**
- **role** (default = `"admin"`)
- **created_at**

---

### 9. `search_logs`
Tracks user search queries for analytics.
- **id** (PK)
- **query** – Search term entered by user.
- **searched_at** – Timestamp of the search.

---

## 🔗 Entity Relationship Diagram (ERD)
- A **movie** can have many actors, directors, and genres (via junction tables).
- **Actors, directors, and genres** are unique and reusable across movies.
- **Users** perform searches, which are logged in `search_logs`.

---

## ✅ Key Design Notes
- Normalized schema to avoid duplicate data.
- Junction tables handle many-to-many relationships.
- Supports **caching** (via `cached_at`) for API results.
- Authentication via `users` table with role-based access.
- `search_logs` enables analytics on user queries.

---
# MovieFlix Dashboard API Documentation

A comprehensive movie management system with authentication, search, and analytics features built with Next.js API routes.

## 🚀 Features

- **Authentication System**: JWT-based login/signup with secure cookie storage
- **Movie Search**: Integration with TMDB API for real-time movie data
- **Data Caching**: Local database storage for improved performance
- **Analytics Dashboard**: Movie statistics and insights
- **User Management**: Email-based user verification system

## 📋 API Endpoints

### Authentication

#### POST `/api/auth/login`
Authenticate user and create session.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "userpassword"
}
```

**Response:**
- **200 OK**: Login successful
- **401 Unauthorized**: Invalid password
- **404 Not Found**: User not found

**Features:**
- Password verification using bcrypt
- JWT token generation with 1-hour expiration
- HttpOnly cookie storage for security
- User role assignment (client)

---

#### POST `/api/auth/signup`
Create new user account.

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "securepassword"
}
```

**Response:**
- **201 Created**: User created successfully
- **400 Bad Request**: Missing email or password
- **409 Conflict**: User already exists

**Features:**
- Email validation
- Password hashing with bcrypt
- Automatic JWT token generation
- Duplicate user prevention

---

#### POST `/api/auth/check-user`
Verify if user exists by email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "exists": true
}
```

**Features:**
- Quick user existence verification
- Email-based lookup
- No sensitive data exposure

---

### Movies

#### GET `/api/movies`
Fetch trending, new arrivals, and upcoming movies.

**Response:**
```json
{
  "trending": [
    {
      "id": 123456,
      "title": "Movie Title",
      "year": "2024",
      "rating": 8.5,
      "poster": "https://image.tmdb.org/t/p/w500/poster.jpg",
      "overview": "Movie description..."
    }
  ],
  "newArrivals": [...],
  "upcoming": [...]
}
```

**Features:**
- Parallel API calls for optimal performance
- TMDB API integration
- Normalized movie data structure
- Error handling with type safety

---

#### GET `/api/movies/search?search={query}`
Search movies by title with caching.

**Query Parameters:**
- `search` (required): Movie title to search

**Response:**
```json
[
  {
    "imdb_id": "tt1234567",
    "title": "Search Result",
    "year": 2023,
    "rating": 7.8,
    "runtime": 120,
    "teaser_url": "https://youtube.com/watch?v=..."
  }
]
```

**Features:**
- Database-first search (cached results)
- TMDB API fallback for new searches
- Search query logging
- Automatic data caching with conflict resolution
- Detailed movie information retrieval

---

#### GET `/api/movies/[id]`
Get detailed movie information by TMDB ID.

**Path Parameters:**
- `id`: TMDB movie ID

**Response:**
```json
{
  "movie": {
    "id": 1,
    "imdb_id": "tt1234567",
    "title": "Movie Title",
    "year": 2023,
    "runtime": 120,
    "rating": 8.0,
    "teaser_url": "https://youtube.com/..."
  },
  "genres": ["Action", "Drama"],
  "directors": ["Director Name"],
  "cast": [
    {
      "name": "Actor Name",
      "character": "Character Name",
      "profile": "https://image.tmdb.org/t/p/w500/profile.jpg"
    }
  ],
  "videos": [
    {
      "name": "Official Trailer",
      "type": "Trailer",
      "url": "https://youtube.com/watch?v=..."
    }
  ],
  "source": "database" // or "tmdb"
}
```

**Features:**
- Complete movie details with cast and crew
- Genre and director information
- Video trailers and teasers
- Database caching with relationship management
- Comprehensive data normalization

---

### Analytics

#### GET `/api/analytics`
Retrieve movie analytics and statistics.

**Response:**
```json
{
  "genreDistribution": [
    {"genre": "Action", "count": 45}
  ],
  "avgRatingsPerGenre": [
    {"genre": "Drama", "avg_rating": 7.8}
  ],
  "avgRuntimePerYear": [
    {"year": 2023, "avg_runtime": 125.5}
  ],
  "topActors": [
    {"actor": "Actor Name", "movie_count": 12}
  ],
  "topDirectors": [
    {"director": "Director Name", "movie_count": 8}
  ]
}
```

**Features:**
- Advanced database analytics using stored procedures
- Genre distribution analysis
- Rating trends by genre
- Runtime analysis over time
- Top performers identification

---

## 🔧 Technical Implementation

### Security Features
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds for password security
- **HTTP-Only Cookies**: Prevents XSS attacks
- **Environment Variables**: Secure API key management

### Database Integration
- **Supabase**: PostgreSQL database with real-time capabilities
- **Data Caching**: Intelligent caching strategy for API optimization
- **Relationship Management**: Proper foreign key relationships
- **Upsert Operations**: Conflict resolution for data integrity

### External APIs
- **TMDB Integration**: The Movie Database API for comprehensive movie data
- **Parallel Processing**: Concurrent API calls for better performance
- **Error Handling**: Robust error management with fallbacks

### Data Normalization
- **Consistent Structure**: Unified movie data format
- **Type Safety**: TypeScript interfaces for data validation
- **Relationship Mapping**: Proper genre, actor, and director associations

---

## 🛠️ Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL=your_supabase_connection_string

# Authentication
JWT_SECRET=your_jwt_secret_key

# External APIs
TMDB_API_KEY=your_tmdb_api_key

# Environment
NODE_ENV=development
```

---

## 🚦 Error Handling

All endpoints include comprehensive error handling:

- **400 Bad Request**: Invalid or missing parameters
- **401 Unauthorized**: Authentication failures
- **404 Not Found**: Resource not found
- **409 Conflict**: Data conflicts (e.g., duplicate users)
- **500 Internal Server Error**: Server-side errors

---

## 📊 Usage Examples

### Authentication Flow
```javascript
// Signup
const signup = await fetch('/api/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

// Login
const login = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
```

### Movie Search
```javascript
// Search movies
const results = await fetch('/api/movies/search?search=batman');
const movies = await results.json();

// Get movie details
const details = await fetch('/api/movies/550'); // Fight Club TMDB ID
const movie = await details.json();
```

### Analytics
```javascript
// Get dashboard analytics
const analytics = await fetch('/api/analytics');
const stats = await analytics.json();
```

---

This API provides a complete backend solution for a movie management dashboard with authentication, search capabilities, and comprehensive analytics features.
