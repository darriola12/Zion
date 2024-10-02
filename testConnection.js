const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL_C,
  ssl: {
    rejectUnauthorized: false, // No verifica el certificado SSL
  },
});

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('Conexión exitosa a la base de datos');

    const res = await client.query('SELECT NOW()');
    console.log('Consulta ejecutada con éxito:', res.rows);

    client.release();
  } catch (err) {
    console.error('Error al conectar con la base de datos:', err);
  }
}

testConnection();