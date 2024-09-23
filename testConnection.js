const { Pool } = require('pg');
require('dotenv').config();

// Verifica que DATABASE_URL esté definido
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // No verifica el certificado del servidor
  },
});

// Función para probar la conexión a la base de datos
async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('Conexión exitosa a la base de datos');

    // Ejecuta una consulta básica para verificar la conexión
    const res = await client.query('SELECT NOW()');
    console.log('Consulta ejecutada con éxito:', res.rows);

    client.release();
  } catch (err) {
    console.error('Error al conectar con la base de datos:', err);
  }
}

// Llama a la función para probar la conexión
testConnection();