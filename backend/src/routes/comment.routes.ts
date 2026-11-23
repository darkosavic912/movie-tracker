import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.ts";
import { addComment, deleteComment, getComments } from "../controllers/comment.controllers.ts";

export const router = Router()

router.get('/:movieId', getComments)
router.post('/:movieId', authMiddleware, addComment)
router.delete('/:id', authMiddleware, deleteComment)

export default router