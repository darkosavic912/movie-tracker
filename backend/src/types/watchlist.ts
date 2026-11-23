export interface Watchlist {
    watchlist_id: number
    user_id: number
    movie_id: number
    status: 'want_to_watch' | 'watching' | 'watched' | null
    is_favorite: boolean 
    created_at: Date
    deleted_at: Date | null
}