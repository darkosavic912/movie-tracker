import type { Request, Response } from "express";
import { mysqlpool } from "../db.ts";
import type { Movie }  from "../types/movie.ts";

export const getComments = async(req:Request, res: Response) => {
 try {
      const tmdb_id = req.params.movieId

      if(!tmdb_id) {
      return res.status(400).json({ message: "tmdb_id not provided"})
     }
     
      const [rows] = await mysqlpool.execute("SELECT comment.*, user.username FROM comment JOIN user ON comment.user_id = user.user_id JOIN movie ON comment.movie_id = movie.movie_id WHERE movie.tmdb_id = ? AND comment.deleted_at IS NULL", [tmdb_id])

      const commentType = rows as Comment[]

      return res.status(200).json({comment: commentType })
    } catch(e) {
        console.error(e)
        return res.status(500).json({
              message: "Error",
              timestamp: new Date().toISOString()
        })
    }
}

export const addComment = async(req: Request, res: Response) => {
    try {
      const { userId } = req.user!;
      const { tmdb_id, title,  poster_path, overview, vote_average, release_date, genre_ids, text} = req.body;

      const [rows] = await mysqlpool.execute( "SELECT * FROM movie WHERE tmdb_id = ?",[tmdb_id],);

      const movies = rows as Movie[];
      const movie = movies[0];
      let movie_id: number;
    
        if (!movie?.tmdb_id) {
          const [result] = (await mysqlpool.execute(
            "INSERT INTO movie(tmdb_id, title, poster_path, overview, vote_average, release_date, genre_ids) VALUES (?,?,?,?,?,?,?)", [tmdb_id, title, poster_path, overview, vote_average, release_date, genre_ids]
          )) as any;
          movie_id = result.insertId; // ID of new row
        } else {
          movie_id = movie.movie_id; // ID of existing row
        }

      await mysqlpool.execute("INSERT INTO comment (user_id, movie_id, text) values (?, ?, ?)", [userId, movie_id, text])

      return res.status(201).json({
        message: "Comment added successfully",
        timestamp: new Date().toISOString()
      })
    } catch(e) {
        console.error(e)
        return res.status(500).json({
              message: "Error",
              timestamp: new Date().toISOString()
        })
    }
}

export const deleteComment = async(req: Request, res: Response) => {
    try {
        const { userId } = req.user!;
        const comment_id = req.params.id;

        await mysqlpool.execute("UPDATE comment SET deleted_at = NOW() where user_id = ? AND comment_id = ?", [userId,comment_id])

        return res.status(200).json({message: "Comment deleted successfully"})

    } catch (e) {
        console.error(e)
        return res.status(500).json({
            message: "Error",
              timestamp: new Date().toISOString()
        })
    }
}
