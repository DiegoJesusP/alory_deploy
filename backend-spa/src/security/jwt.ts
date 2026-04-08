import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import type { Request } from 'express'

interface AccessTokenPayload {
    sub: string
    jti: string
    full_name: string
    role: string
    type: 'access'
    iat: number
    exp: number
}

interface RefreshTokenPayload {
    sub: string
    type: 'refresh'
    iat: number
    exp: number
}

export type TokenPayload = AccessTokenPayload | RefreshTokenPayload

const getSecret = (): string => process.env.JWT_SECRET as string

const getExpiration = (): number => Number(process.env.JWT_EXPIRATION) || 3600

const getRefreshExpiration = (): number => Number(process.env.JWT_REFRESH_EXPIRATION) || 604800

export const generateAccessToken = (user: { username: string; full_name: string; role: string }): string => {
    return jwt.sign(
        {
            full_name: user.full_name,
            role: user.role,
            type: 'access'
        },
        getSecret(),
        {
            subject: user.username,
            expiresIn: getExpiration(),
            jwtid: uuidv4()
        }
    )
}

export const generateRefreshToken = (username: string): string => {
    return jwt.sign(
        { type: 'refresh' },
        getSecret(),
        {
            subject: username,
            expiresIn: getRefreshExpiration()
        }
    )
}

export const verifyToken = (token: string): TokenPayload | null => {
    try {
        return jwt.verify(token, getSecret()) as TokenPayload
    } catch {
        return null
    }
}

export const extractUsername = (token: string): string | null => {
    return verifyToken(token)?.sub ?? null
}

export const extractJti = (token: string): string | null => {
    const decoded = verifyToken(token)
    if (decoded && 'jti' in decoded) return decoded.jti
    return null
}

export const extractTokenType = (token: string): string | null => {
    return verifyToken(token)?.type ?? null
}

export const isTokenValid = (token: string): boolean => {
    return verifyToken(token) !== null
}

export const resolveToken = (req: Request): string | null => {
    const bearer = req.headers['authorization']
    if (bearer && bearer.startsWith('Bearer ')) {
        return bearer.substring(7).trim()
    }
    return null
}

export const getExpiryFromToken = (token: string): Date | null => {
    const decoded = verifyToken(token)
    if (decoded?.exp) return new Date(decoded.exp * 1000)
    return null
}
