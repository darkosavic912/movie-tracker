export interface User {
    user_id: number
    email: string
    username: string
    first_name: string
    last_name: string
    password_hash: string
    created_at: Date
    deleted_at: Date | null
}