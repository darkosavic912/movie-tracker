# Movie Tracker

A small full-stack app for keeping track of movies. You search movies (data comes from TMDB), build a watchlist, leave comments, and, if you can't decide what to watch, ask an AI to pick between two movies from your list.

I built it as a university project and as my first time writing an Express backend with raw SQL and JWT auth from scratch. Backend is the part I'm most comfortable with; the frontend is where I leaned on help the most.

## Stack

- **Frontend:** Vue 3 (Composition API), TypeScript, Pinia, Vue Router, Bootstrap 5, Axios
- **Backend:** Node.js, Express, TypeScript
- **Database:** MariaDB, accessed with `mysql2` (no ORM, I wrote the SQL myself)
- **External APIs:** TMDB (movie data), Groq (AI recommendations)

## What it does

- Browse popular and top-rated movies, filter by genre, search by title, jump to any page
- Movie details page with comments (anyone can read, only logged-in users can write)
- Watchlist per user with status, remove, and pagination
- "Recommend a movie": pick two movies from your watchlist, choose a mood, get a suggestion from an LLM
- Register, login, logout, change password, delete account
- Protected routes on both frontend (router guard) and backend (auth middleware)

## How it's put together

```
Vue frontend  ->  Express API  ->  MariaDB
                      |
                      +-> TMDB API
                      +-> Groq API
```

The frontend never talks to TMDB or the database directly, only to my API. Backend layout is simple: routes -> (middleware) -> controllers -> database. There is no service layer, controllers talk to the database directly. For a project this size it was easier to follow.

The database stores users, movies, watchlist entries and comments. Movie details are fetched from TMDB on demand. A row in `movie` is created only when someone adds the movie to a watchlist or comments on it, so foreign keys have something to point to.

## Auth and security

What I did:

- Passwords hashed with bcrypt (cost 12)
- Access and refresh JWTs stored in `httpOnly` cookies, so frontend JavaScript can't read them
- `sameSite: strict` on the cookies and CORS limited to the frontend origin
- All SQL uses parameterized queries
- Input validation with `express-validator` on the backend, regex checks on the frontend
- Soft delete (`deleted_at`) for users, watchlist items and comments; on account deletion the email is changed so it can be reused
- Users can only modify their own watchlist entries and comments (queries filter by the user id from the token, never from the request body)

What I did **not** do (known gaps):

- No rate limiting, so login can be brute-forced
- Refresh tokens aren't stored server-side, so logging out clears the cookie but doesn't invalidate the token
- No CSRF tokens (relying on `sameSite` only)
- No security headers (e.g. Helmet)
- Cookies have `secure: false` for local development; this must be `true` behind HTTPS

I plan to build a deliberately vulnerable copy of this app and attack it, then patch things and compare.

## Running it locally

Requirements: Node.js, MariaDB, a TMDB API key, a Groq API key.

1. Create a database and the tables (`user`, `movie`, `watchlist`, `comment`). Schema is in `/database/schema.sql`. *(add this file)*
2. Backend:
   ```
   cd backend
   npm install
   npm run dev
   ```
3. Create `backend/.env` with:
   ```
   PORT=3000
   DB_HOST=
   DB_PORT=
   DB_USER=
   DB_PASSWORD=
   DB_NAME=
   JWT_ACCESS_SECRET=
   JWT_REFRESH_SECRET=
   JWT_ACCESS_TTL=3600
   JWT_REFRESH_TTL=86400
   TMDB_API_KEY=
   GROQ_API_KEY=
   ```
4. Frontend:
   ```
   cd frontend
   npm install
   npm run dev
   ```
   It runs on `http://localhost:5173`, the API on `http://localhost:3000`.

## API overview

| Method | Route | Auth   | What it does |
|---|---|--------|---|
| POST | `/api/auth/register` | no     | create account |
| POST | `/api/auth/login` | no     | log in, sets cookies |
| POST | `/api/auth/refresh` | cookie | new access token |
| POST | `/api/auth/logout` | no     | clears cookies |
| GET | `/api/auth/me` | yes    | current user |
| PUT/DELETE | `/api/auth/profile` | yes    | change password / delete account |
| GET | `/api/movies` `?query=` | no     | search |
| GET | `/api/movies/popular`, `/top-rated`, `/genre` | no     | lists |
| GET | `/api/movies/:id` | no     | details |
| GET/POST | `/api/watchlist` | yes    | list / add |
| PATCH/DELETE | `/api/watchlist/:id` | yes    | update status / remove |
| GET | `/api/comments/:movieId` | no     | read comments |
| POST | `/api/comments/:movieId` | yes    | add comment |
| DELETE | `/api/comments/:id` | yes    | delete own comment |
| POST | `/api/ai/recommend` | yes      | AI recommendation for two movies |

## Things I'd change

- Put the Vue API calls into proper service files instead of calling Axios from stores and views
- Store refresh tokens (hashed) in the database and rotate them
- Add rate limiting and a few tests
- Translate leftover Serbian strings in the UI and code

## Credits

Movie data and images from [TMDB](https://www.themoviedb.org/). This product uses the TMDB API but is not endorsed or certified by TMDB.