import 'dotenv/config'
import express from'express'
import cors from 'cors'
import morgan from 'morgan'
import { mysqlpool } from './db.ts'
import authRouter from './routes/auth.routes.ts'
import movieRouter from './routes/movie.routes.ts'
import watchlistRouter from './routes/watchlist.routes.ts'
import commentRouter from './routes/comment.routes.ts'
import aiRouter from './routes/ai.routes.ts'
import cookieParser from 'cookie-parser'

const app = express()
app.use(express.json())
app.use(morgan('short'))
app.use(cookieParser())
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))
app.use('/api/auth', authRouter)
app.use('/api/movies', movieRouter)
app.use('/api/watchlist', watchlistRouter)
app.use('/api/ai', aiRouter)
app.use('/api/comments', commentRouter)

async function startServer() {
    try {
    const connect = await mysqlpool.getConnection()
    connect.release()
    const port = process.env.PORT || 3000
    //console.log("Successfully connected to database")
    app.listen(port, () => console.log(`Server starting on port ${port}`))
    } catch (error) {
        console.error("Error while connecting to database:", error)
    }
   
}
startServer()


