import * as dotenv from 'dotenv'
import * as mysql from 'mysql2'

dotenv.config()

const config = {
   connectionLimit: 10 || process.env.DB_CONNECTION_LIMIT,
   password: process.env.DB_PASSWORD,
   user: process.env.DB_USER,
   database: process.env.DB_NAME,
   host: process.env.DB_HOST,
   port: 3306 || process.env.DB_PORT,
   connectTimeout: 60 * 60 * 1000,
   supportBigNumbers: true,
   bigNumberStrings: true,
   charset: 'utf8mb4_unicode_ci',
   multipleStatements: true,
}

const pool: mysql.Pool = mysql.createPool(config)

export default pool
