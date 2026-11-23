import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.ts";
import { addToWatchlist, getWatchlist,updateStatus, deleteFromWatchlist } from "../controllers/watchlist.controllers.ts";

const router = Router()

router.post('/', authMiddleware, addToWatchlist)
router.get('/', authMiddleware, getWatchlist)
router.patch('/:id', authMiddleware, updateStatus)
router.delete('/:id', authMiddleware, deleteFromWatchlist)

export default router