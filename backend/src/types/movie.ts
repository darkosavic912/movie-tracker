export interface Movie {
    movie_id: number
    tmdb_id: number
    title: string
    poster_path: string
    is_custom: boolean 
    created_at: Date
    updated_at: Date | null
}