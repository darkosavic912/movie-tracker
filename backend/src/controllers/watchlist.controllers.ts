import type { Request, Response } from "express";
import type { Watchlist } from "../types/watchlist.ts";
import type { Movie } from "../types/movie.ts";
import { mysqlpool } from "../db.ts";

export const addToWatchlist = async (req: Request, res: Response) => {
  try {
    const {  tmdb_id, title, poster_path, overview, vote_average, release_date, genre_ids, status } = req.body;
    const { userId } = req.user!;
    const [rows] = await mysqlpool.execute(
      "SELECT * FROM movie WHERE tmdb_id = ?",
      [tmdb_id],
    );

    const movies = rows as Movie[];
    const movie = movies[0];
    let movie_id: number;

    if (!movie?.tmdb_id) {
      const [result] = (await mysqlpool.execute(
        "INSERT INTO movie(tmdb_id, title, poster_path, overview, vote_average, release_date, genre_ids) VALUES (?,?,?,?,?,?,?)",
        [tmdb_id, title, poster_path, overview, vote_average, release_date, genre_ids]
      )) as any;
      movie_id = result.insertId; // ID of new row
    } else {
      movie_id = movie.movie_id; // ID of existing row
    }

    const [rows1] = await mysqlpool.execute(
      "SELECT * FROM watchlist WHERE user_id = ? AND movie_id = ?  AND deleted_at IS NULL",
      [userId, movie_id],
    );
    const watchlists = rows1 as Watchlist[];
    const watchlist = watchlists[0];

    if (watchlist?.user_id) {
    return res.status(409).json({ message: "This movie is already on your watchlist" })
    }

      await mysqlpool.execute(
        "INSERT INTO watchlist(user_id, movie_id, status) values(?,?, ?)",
        [userId, movie_id, status],
      );
    
    return res.status(201).json({
      message: "Movie successfully added to your watchlist",
      timestamp: new Date().toISOString()
    });

  } catch (e) {
    console.error(e);
    return res.status(500).json({
      message: "Greska",
      timestamp: new Date().toISOString(),
    });
  }
};

export const getWatchlist = async (req: Request, res: Response) => {
    try {
      const { userId } = req.user!;

     const [rows] = await mysqlpool.execute("SELECT watchlist.*, movie.title, movie.poster_path, movie.overview, movie.vote_average, movie.release_date, movie.genre_ids FROM watchlist JOIN movie ON watchlist.movie_id = movie.movie_id WHERE watchlist.user_id = ? AND watchlist.deleted_at IS NULL", [userId])
      const watchlists = rows as Watchlist[]

      return res.status(200).json({watchlist: watchlists})

    } catch (e) {
    console.error(e);
    return res.status(500).json({
      message: "Error",
      timestamp: new Date().toISOString(),
    });
  }
}

export const updateStatus = async (req: Request, res: Response) => {
   try {
      const { userId } = req.user!;
      const  watchlist_id  = req.params.id;
      const { status } = req.body;

      await mysqlpool.execute("UPDATE watchlist SET status = ? WHERE watchlist_id = ? AND user_id = ? ", [status,watchlist_id,userId])

      return res.status(200).json({ status: status })

   } catch (e) {
    console.error(e)
    return res.status(500).json({
      message: "Error",
      timestamp: new Date().toISOString()
    })
   }
}

export const deleteFromWatchlist = async(req: Request, res: Response) => {
  try {
     const { userId } = req.user!;
     const watchlist_id = req.params.id;
     await mysqlpool.execute("UPDATE watchlist SET deleted_at = NOW() WHERE watchlist_id = ? AND user_id = ?", [watchlist_id,userId])

     return res.status(200).json({message: "Removed from watchlist"})

  } catch (e){
    console.error(e)
    return res.status(500).json({
      message: "Error",
      timestamp: new Date().toISOString()
    })
  }
}