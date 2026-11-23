export interface Comment {
    comment_id: number
    user_id: number
    movie_id: number
    text: string
    created_at: Date
    deleted_at: Date | null
}