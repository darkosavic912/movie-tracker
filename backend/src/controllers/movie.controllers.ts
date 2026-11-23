import axios from "axios";
import type { Request, Response } from "express";

const tmdbClient = axios.create({
    baseURL : "https://api.themoviedb.org/3", 
    params: {
        api_key: process.env.TMDB_API_KEY,
    }
})

export const getAllMovies = async (req: Request, res: Response) => {
    try {
    const response = await tmdbClient.get('/search/movie', {
        params: { 
            query : req.query.query
        }
    })
    return res.status(200).json(response.data)
   } catch (e) {
    console.error(e)
    return res.status(500).json({
        message: "Failed to fetch movies from the TMDB API",
        timestamp: new Date().toISOString()
    })
   } 
}

export const getMovieById = async (req: Request, res: Response) => {
    try {
    const response = await tmdbClient.get(`/movie/${req.params.id}`)
    return res.status(200).json(response.data)
    } catch (e) {
    console.error(e)
    return res.status(500).json({
        message: "Failed to fetch movie from the TMDB API",
        timestamp: new Date().toISOString()
    })
   } 
}

export const getPopularMovies = async (req: Request, res: Response) => {
    try {
        const { page } = req.query
        const response = await tmdbClient.get('/movie/popular', {
            params: { page: page || 1 }
        })
        return res.status(200).json(response.data)
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            message: "Error",
            timestamp: new Date().toISOString()
        })
    }
}

export const getTopRated = async (req: Request, res: Response) => {
    try {
        const { page } = req.query
        const response = await tmdbClient.get('/movie/top_rated', {
            params: { page: page || 1 }
        })
        return res.status(200).json(response.data)
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            message: "Error",
            timestamp: new Date().toISOString()
        })
    }
}

export const getByGenre = async (req: Request, res: Response) => {
    try {
        const { genre_id, page } = req.query
        const response = await tmdbClient.get('/discover/movie', {
            params: { 
                with_genres: genre_id,
                sort_by: 'popularity.desc',
                page: page || 1
            }
        })
        return res.status(200).json(response.data)
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            message: "Error",
            timestamp: new Date().toISOString()
        })
    }
}

