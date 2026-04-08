import type { Request, Response, NextFunction } from 'express'
import { resolveToken, verifyToken } from './jwt'
import { isBlacklisted } from './blacklist'

declare global {
    namespace Express {
        interface Request {
            role?: string
            username?: string
        }
    }
}

export const protectedEndpoint = (...allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = resolveToken(req)

            if (!token)
                return res.status(403).json({ message: 'Token no proporcionado' })

            // Rechazar tokens revocados (logout antes de expirar)
            const jti = (verifyToken(token) as { jti?: string } | null)?.jti
            if (jti && isBlacklisted(jti))
                return res.status(401).json({ message: 'Token inválido - sesión cerrada' })

            // Solo aceptar tokens de tipo access
            const decoded = verifyToken(token)

            if (!decoded)
                return res.status(401).json({ message: 'Token inválido o expirado' })

            if (decoded.type !== 'access')
                return res.status(401).json({ message: 'Token inválido - se requiere token de acceso' })

            req.role = decoded.role as string
            req.username = decoded.sub

            if (!req.role || !allowedRoles.includes(req.role))
                return res.status(403).json({ message: 'Acceso denegado' })

            next()
        } catch (error) {
            console.error(error)
            res.status(500).json({ message: `Ocurrió un problema: ${(error as Error).message}` })
        }
    }
}
