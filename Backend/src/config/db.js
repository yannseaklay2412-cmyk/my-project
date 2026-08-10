//we connect to the database  here 
import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});
const result = await pool.query('SELECT NOW()');
console.log('Database connection successful');

 export default pool;