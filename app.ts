import Express, { Application } from 'express'

let app: Application | undefined = undefined

const PORT: string | number = 3000 || process.env.PORT

app = Express()

app.use(Express.json())
app.use(Express.urlencoded({ extended: true }))

app.listen(PORT, () => console.log(`Server started on PORT ${PORT}`))
