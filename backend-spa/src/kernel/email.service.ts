import nodemailer from 'nodemailer'
import fs from 'fs'
import path from 'path'

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST as string,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
        user: process.env.EMAIL_USER as string,
        pass: process.env.EMAIL_PASSWORD as string
    }
})

const loadTemplate = (templateName: string, variables: Record<string, string>): string => {
    const templatePath = path.join(__dirname, '../resources', `${templateName}.html`)
    let html = fs.readFileSync(templatePath, 'utf-8')

    for (const [key, value] of Object.entries(variables)) {
        html = html.replaceAll(`{{${key}}}`, value)
    }

    return html
}

export const sendPasswordResetEmail = async (email: string, name: string, token: string): Promise<void> => {
    const resetUrl = `${process.env.APP_URL}/reset-password?token=${token}`

    const html = loadTemplate('password-reset', { name, token, resetUrl })

    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Recuperación de contraseña - Spa Management',
        html
    })
}

export const sendPasswordChangedEmail = async (email: string, name: string): Promise<void> => {
    const html = loadTemplate('password-changed', { name })

    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Contraseña actualizada - Spa Management',
        html
    })
}
