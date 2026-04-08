import { app } from './config/server'
import { syncDatabase } from './config/sync'

const main = async () => {
    try {
        await syncDatabase()

        app.listen(app.get('port'))
        console.log(`Running in http://localhost:${app.get('port')}/`)
    } catch (error) {
        console.error('An error ocurred: ', error)
    }
}

main()
