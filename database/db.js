import pg from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;
const client = new Client({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
    keepAlive: true
  });

client.connect()
    .then(() => console.log("Connected to database"))
    .catch(err => console.log(err));

export default {
    query: async (text, params) => {
        const res = await client.query(text, params);
        return res;
    }
};