import { Router } from 'express'
import { loginController, refreshController, logoutController, forgotPasswordController, validateTokenController, resetPasswordController } from './auth.controller'
import { authLimiter } from '../../security/rate-limit'
import { protectedEndpoint } from '../../security/protected-endpoint'

const router = Router()

router.post('/login', authLimiter, loginController)
router.post('/refresh', authLimiter, refreshController)
router.post('/logout', protectedEndpoint('ADMIN', 'EMPLOYEE'), logoutController)
router.post('/password-reset/request', authLimiter, forgotPasswordController)
router.post('/password-reset/validate', authLimiter, validateTokenController)
router.post('/password-reset/confirm', authLimiter, resetPasswordController)

export default router
