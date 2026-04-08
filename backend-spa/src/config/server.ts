import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import { globalLimiter } from '../security/rate-limit'
import authRoutes from '../modules/auth/auth.routes'
import userRoutes from '../modules/users/user.routes'
import clientRoutes from '../modules/clients/client.routes'
import serviceRoutes from '../modules/services/service.routes'
import productRoutes from '../modules/products/product.routes'
import appointmentRoutes from '../modules/appointments/appointment.routes'

process.loadEnvFile()

const app = express()

app.set('port', process.env.PORT || 3001)

app.use(helmet())
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}))
app.use(cookieParser())
app.use(globalLimiter)
app.use(express.json({ limit: '50mb' }))

app.get('/', (request: express.Request, response: express.Response) => {
    response.send('Spa Management API')
})

app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/users', userRoutes)
app.use('/api/v1/clients', clientRoutes)
app.use('/api/v1/services', serviceRoutes)
app.use('/api/v1/products', productRoutes)
app.use('/api/v1/appointments', appointmentRoutes)

export { app }
