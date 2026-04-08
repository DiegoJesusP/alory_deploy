import { Request, Response } from 'express'
import { login, refresh, logout, requestPasswordReset, validateResetToken, resetPassword } from './auth.service'
import { resolveToken } from '../../security/jwt'
import { extractRefreshToken, setRefreshTokenCookie, clearRefreshTokenCookie } from '../../security/cookie.service'
import { ApiResponse } from '../../kernel/api.response'
import { TypesResponse } from '../../kernel/types.response'

export const loginController = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body

        if (!username || !password)
            return res.status(400).json(new ApiResponse(TypesResponse.ERROR, 'Usuario y contraseña requeridos'))

        const ip = req.ip
        const device = req.headers['user-agent']

        const tokens = await login(username, password, ip, device)

        setRefreshTokenCookie(res, tokens.refreshToken)

        return res.status(200).json(
            new ApiResponse({ access_token: tokens.accessToken }, TypesResponse.SUCCESS, 'Inicio de sesión exitoso')
        )
    } catch (error) {
        const message = (error as Error).message

        if (message === 'Credenciales inválidas' || message === 'Usuario inactivo')
            return res.status(401).json(new ApiResponse(TypesResponse.ERROR, message))

        console.error(error)
        return res.status(500).json(new ApiResponse(TypesResponse.ERROR, 'Error en el servidor'))
    }
}

export const refreshController = async (req: Request, res: Response) => {
    try {
        const rawRefreshToken = extractRefreshToken(req)

        if (!rawRefreshToken)
            return res.status(401).json(new ApiResponse(TypesResponse.ERROR, 'Refresh token no encontrado'))

        const ip = req.ip
        const device = req.headers['user-agent']

        const tokens = await refresh(rawRefreshToken, ip, device)

        setRefreshTokenCookie(res, tokens.refreshToken)

        return res.status(200).json(
            new ApiResponse({ access_token: tokens.accessToken }, TypesResponse.SUCCESS, 'Token renovado correctamente')
        )
    } catch (error) {
        const message = (error as Error).message

        if (['Refresh token inválido', 'Refresh token revocado', 'Refresh token expirado'].includes(message))
            return res.status(401).json(new ApiResponse(TypesResponse.ERROR, message))

        console.error(error)
        return res.status(500).json(new ApiResponse(TypesResponse.ERROR, 'Error interno al renovar el token'))
    }
}

export const logoutController = async (req: Request, res: Response) => {
    try {
        const accessToken = resolveToken(req)
        const refreshToken = extractRefreshToken(req)

        if (!accessToken || !refreshToken)
            return res.status(400).json(new ApiResponse(TypesResponse.ERROR, 'Tokens requeridos'))

        await logout(accessToken, refreshToken)

        clearRefreshTokenCookie(res)

        return res.status(200).json(new ApiResponse(TypesResponse.SUCCESS, 'Sesión cerrada correctamente'))
    } catch (error) {
        console.error(error)
        return res.status(500).json(new ApiResponse(TypesResponse.ERROR, 'Error al cerrar sesión'))
    }
}

export const forgotPasswordController = async (req: Request, res: Response) => {
    try {
        const { email } = req.body

        if (!email)
            return res.status(400).json(new ApiResponse(TypesResponse.ERROR, 'Correo electrónico requerido'))

        await requestPasswordReset(email)

        return res.status(200).json(new ApiResponse(TypesResponse.SUCCESS, 'Se ha enviado un correo con las instrucciones'))
    } catch (error) {
        const message = (error as Error).message

        if (message === 'No existe un usuario con ese correo electrónico')
            return res.status(404).json(new ApiResponse(TypesResponse.ERROR, message))

        console.error(error)
        return res.status(500).json(new ApiResponse(TypesResponse.ERROR, 'Error interno al procesar la solicitud'))
    }
}

export const validateTokenController = async (req: Request, res: Response) => {
    try {
        const { token } = req.body

        if (!token)
            return res.status(400).json(new ApiResponse(TypesResponse.ERROR, 'Token requerido'))

        const email = await validateResetToken(token)

        return res.status(200).json(new ApiResponse({ email }, TypesResponse.SUCCESS, 'Token válido'))
    } catch (error) {
        const message = (error as Error).message

        if (message === 'Token inválido' || message === 'El token ha expirado')
            return res.status(401).json(new ApiResponse(TypesResponse.ERROR, message))

        console.error(error)
        return res.status(500).json(new ApiResponse(TypesResponse.ERROR, 'Error interno al validar el token'))
    }
}

export const resetPasswordController = async (req: Request, res: Response) => {
    try {
        const { email, password, confirmPassword } = req.body

        if (!email || !password || !confirmPassword)
            return res.status(400).json(new ApiResponse(TypesResponse.ERROR, 'Todos los campos son requeridos'))

        await resetPassword({ email, password, confirmPassword })

        return res.status(200).json(new ApiResponse(TypesResponse.SUCCESS, 'Contraseña restablecida correctamente'))
    } catch (error) {
        const message = (error as Error).message

        if (message === 'Las contraseñas no coinciden')
            return res.status(400).json(new ApiResponse(TypesResponse.ERROR, message))

        if (message === 'Usuario no encontrado')
            return res.status(404).json(new ApiResponse(TypesResponse.ERROR, message))

        console.error(error)
        return res.status(500).json(new ApiResponse(TypesResponse.ERROR, 'Error interno al restablecer la contraseña'))
    }
}
