import { Router } from 'express'
import { register,refresh,login,logout, getMe, changePassword, deleteAccount,registerValidation, loginValidation} from '../controllers/auth.controllers.ts'
import { authMiddleware } from '../middleware/auth.middleware.ts'

const router = Router()

router.post('/register', registerValidation, register)
router.post('/login', loginValidation, login)
router.post('/refresh', refresh)
router.post('/logout', logout)
router.get('/me', authMiddleware, getMe)
router.put('/profile', authMiddleware, changePassword)
router.delete('/profile', authMiddleware, deleteAccount)

export default router