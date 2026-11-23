import { Router } from "express"
import { getRecommendation } from "../controllers/ai.controllers.ts"
import { authMiddleware } from '../middleware/auth.middleware.ts'

const router = Router()

router.post('/recommend', authMiddleware, getRecommendation)

export default router