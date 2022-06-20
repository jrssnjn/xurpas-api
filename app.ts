import Express, { Application } from 'express'
import {
   getConfiguration,
   getParkingSpots,
   parkVehicle,
} from './parking/controller'

let app: Application | undefined = undefined

const PORT: string | number = 3000 || process.env.PORT

app = Express()

app.use(Express.json())
app.use(Express.urlencoded({ extended: true }))

app.get('/config', getConfiguration)
app.get('/parking-spots', getParkingSpots)
app.post('/park-vehicle', parkVehicle)

app.listen(PORT, () => console.log(`Server started on PORT ${PORT}`))
