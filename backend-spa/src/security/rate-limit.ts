import rateLimit from 'express-rate-limit'

// Limitador global: aplica a todos los endpoints
export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    limit: 100,
    message: { message: 'Demasiadas peticiones, intenta de nuevo más tarde' },
    standardHeaders: 'draft-8',
    legacyHeaders: false
})

// Limitador estricto: para endpoints de autenticación (login, refresh)
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    limit: 10,
    message: { message: 'Demasiados intentos de autenticación, intenta de nuevo más tarde' },
    standardHeaders: 'draft-8',
    legacyHeaders: false
})
