import { randomBytes } from 'crypto'
import { User } from '../../models/user.model'
import { RefreshToken } from '../../models/refresh-token.model'
import { comparePassword, hashPassword } from '../../security/bcrypt'
import {
    generateAccessToken,
    generateRefreshToken,
    isTokenValid,
    extractJti,
    getExpiryFromToken
} from '../../security/jwt'
import { addToBlacklist } from '../../security/blacklist'
import { sendPasswordResetEmail, sendPasswordChangedEmail } from '../../kernel/email.service'

const RESET_TOKEN_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
const RESET_TOKEN_LENGTH = 5

interface UserAttributes {
    id: number
    username: string
    password: string
    full_name: string
    email: string
    role: string
    is_active: boolean
    token: string | null
    date_expiration: Date | null
}

const generateResetToken = (): string => {
    const bytes = randomBytes(RESET_TOKEN_LENGTH)
    return Array.from(bytes)
        .map(b => RESET_TOKEN_CHARS[b % RESET_TOKEN_CHARS.length])
        .join('')
}

interface ResetPasswordDto {
    email: string
    password: string
    confirmPassword: string
}

interface RefreshTokenAttributes {
    id: number
    user_id: number
    token: string
    expires_at: Date
    revoked: boolean
}

export const login = async (
    username: string,
    password: string,
    ip?: string,
    device?: string
) => {
    const user = await User.findOne({ where: { username } })

    if (!user)
        throw new Error('Credenciales inválidas')

    const userData = user.get() as UserAttributes

    if (!userData.is_active)
        throw new Error('Usuario inactivo')

    const passwordMatch = await comparePassword(password, userData.password)

    if (!passwordMatch)
        throw new Error('Credenciales inválidas')

    const accessToken = generateAccessToken({
        username: userData.username,
        full_name: userData.full_name,
        role: userData.role
    })

    const newRefreshToken = generateRefreshToken(userData.username)
    const expiresAt = getExpiryFromToken(newRefreshToken)

    await RefreshToken.create({
        user_id: userData.id,
        token: newRefreshToken,
        expires_at: expiresAt,
        revoked: false,
        device: device ?? null,
        ip_address: ip ?? null
    })

    return { accessToken, refreshToken: newRefreshToken }
}

export const refresh = async (
    rawRefreshToken: string,
    ip?: string,
    device?: string
) => {
    const storedToken = await RefreshToken.findOne({
        where: { token: rawRefreshToken },
        include: [User]
    })

    if (!storedToken)
        throw new Error('Refresh token inválido')

    const storedData = storedToken.get() as RefreshTokenAttributes

    if (storedData.revoked)
        throw new Error('Refresh token revocado')

    if (new Date(storedData.expires_at) < new Date())
        throw new Error('Refresh token expirado')

    if (!isTokenValid(rawRefreshToken))
        throw new Error('Refresh token inválido')

    const user = storedToken.get('User') as UserAttributes

    // Revocar el refresh token anterior (rotation)
    await storedToken.update({ revoked: true })

    const accessToken = generateAccessToken({
        username: user.username,
        full_name: user.full_name,
        role: user.role
    })

    const newRefreshToken = generateRefreshToken(user.username)
    const expiresAt = getExpiryFromToken(newRefreshToken)

    await RefreshToken.create({
        user_id: storedData.user_id,
        token: newRefreshToken,
        expires_at: expiresAt,
        revoked: false,
        device: device ?? null,
        ip_address: ip ?? null
    })

    return { accessToken, refreshToken: newRefreshToken }
}

export const logout = async (accessToken: string, refreshToken: string) => {
    const jti = extractJti(accessToken)

    if (jti) addToBlacklist(jti)

    await RefreshToken.update(
        { revoked: true },
        { where: { token: refreshToken, revoked: false } }
    )
}

export const requestPasswordReset = async (email: string): Promise<void> => {
    const user = await User.findOne({ where: { email } })

    if (!user)
        throw new Error('No existe un usuario con ese correo electrónico')

    const userData = user.get() as UserAttributes

    const token = generateResetToken()
    const dateExpiration = new Date(Date.now() + 15 * 60 * 1000) // 15 minutos

    await user.update({ token, date_expiration: dateExpiration })

    // Fire-and-forget: la respuesta HTTP no espera al SMTP
    sendPasswordResetEmail(userData.email, userData.full_name, token)
        .catch(err => console.error('Error al enviar email de recuperación:', err))
}

export const validateResetToken = async (token: string): Promise<string> => {
    const user = await User.findOne({ where: { token } })

    if (!user)
        throw new Error('Token inválido')

    const userData = user.get() as UserAttributes

    if (!userData.date_expiration || new Date() > new Date(userData.date_expiration)) {
        await user.update({ token: null, date_expiration: null })
        throw new Error('El token ha expirado')
    }

    return userData.email
}

export const resetPassword = async (dto: ResetPasswordDto): Promise<void> => {
    if (dto.password !== dto.confirmPassword)
        throw new Error('Las contraseñas no coinciden')

    const user = await User.findOne({ where: { email: dto.email } })

    if (!user)
        throw new Error('Usuario no encontrado')

    const userData = user.get() as UserAttributes

    // Revocar todas las sesiones activas
    await RefreshToken.destroy({ where: { user_id: userData.id } })

    const hashedPassword = await hashPassword(dto.password)

    await user.update({ password: hashedPassword, token: null, date_expiration: null })

    sendPasswordChangedEmail(userData.email, userData.full_name)
        .catch(err => console.error('Error al enviar email de confirmación:', err))
}
