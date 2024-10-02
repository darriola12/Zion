const { Pool } = require("pg");
require("dotenv").config();

// Verifica que DATABASE_URL_C esté definido
if (!process.env.DATABASE_URL_C) {
  throw new Error("DATABASE_URL_C is not defined in environment variables");
}

let pool;

if (process.env.NODE_ENV === "development") {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL_C,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  // Función para conectar y verificar la conexión
  async function testConnection() {
    try {
      const client = await pool.connect();
      console.log('Conexión exitosa a la base de datos');
      client.release(); // Libera el cliente después de la conexión
    } catch (error) {
      console.error('Error al conectar con la base de datos:', error);
    }
  }

  // Llama a la función para probar la conexión
  testConnection();

  // Exportar la función query
  module.exports = {
    async query(text, params) {
      try {
        const res = await pool.query(text, params);
        console.log("Consulta ejecutada", { text });
        return res;
      } catch (error) {
        console.error("Error en la consulta", { text });
        throw error;
      }
    },
  };
} else {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  // Exporta el pool para su uso en otras partes de la aplicación
  module.exports = pool;
}
