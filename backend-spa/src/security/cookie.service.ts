import type { Request, Response } from 'express'

const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken'
const REFRESH_TOKEN_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 // 7 días en segundos

export const extractRefreshToken = (req: Request): string | null => {
    const cookies = req.cookies as Record<string, string> | undefined
    return cookies?.[REFRESH_TOKEN_COOKIE_NAME] ?? null
}

export const setRefreshTokenCookie = (res: Response, refreshToken: string): void => {
    res.setHeader(
        'Set-Cookie',
        `${REFRESH_TOKEN_COOKIE_NAME}=${refreshToken}; HttpOnly; Secure; Path=/; SameSite=Strict; Max-Age=${REFRESH_TOKEN_COOKIE_MAX_AGE}`
    )
}

export const clearRefreshTokenCookie = (res: Response): void => {
    res.setHeader(
        'Set-Cookie',
        `${REFRESH_TOKEN_COOKIE_NAME}=; HttpOnly; Secure; Path=/; SameSite=Strict; Max-Age=0`
    )
}
