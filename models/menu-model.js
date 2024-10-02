const pool = require("../database")

/* ***************************
 *  Get all  data
 * ************************** */
async function getPedidos(searchQuery) {
  console.log(`Search query model: ${searchQuery}`);
  
  let query;
  let params = [];
  
  if (searchQuery) {
    // Si hay un término de búsqueda, usa el filtro
    query = `
      SELECT 
        c.cliente_id,
        c.nombre, 
        c.correo, 
        c.area, 
        c.mision, 
        p.pedido_id 
      FROM 
        public.clientes c
      JOIN 
        public.pedidos p ON c.cliente_id = p.cliente_id
      WHERE 
        c.nombre ILIKE $1 OR c.mision ILIKE $1
    `;
    params = [`%${searchQuery}%`]; // Solo si hay búsqueda
  } else {
    // Si no hay búsqueda, obtén todos los registros
    query = `
      SELECT 
        c.nombre, 
        c.correo, 
        c.area, 
        c.mision, 
        p.pedido_id 
      FROM 
        public.clientes c
      JOIN 
        public.pedidos p ON c.cliente_id = p.cliente_id
    `;
  }

  return await pool.query(query, params);
}


async function getPedidosInfoById(pedido_id) {
  try {
    const sql = `
      SELECT 
        c.nombre, 
        c.correo, 
        c.area, 
        c.mision, 
        p.pedido_id, 
        c.cliente_id, 
        p.producto, 
        p.cantidad,
        p.precio, 
        p.fecha,
        p.entregado,
        p.reportado,
        p.incompleto,
        p.comentarios,
        imgf.url 
      FROM 
        public.clientes c
      JOIN 
        public.pedidos p ON c.cliente_id = p.cliente_id
      JOIN 
        public.imagen_productos imgf ON p.pedido_id = imgf.pedido_id
      WHERE 
        p.pedido_id = $1
    `;
    
    const result = await pool.query(sql, [pedido_id]);

    if (result.rows.length === 0) {
      throw new Error('Pedido no encontrado');
    }

    // Agrupar imágenes por pedido_id
    const pedidoData = result.rows.reduce((acc, row) => {
      if (!acc[row.pedido_id]) {
        acc[row.pedido_id] = { ...row, imagenes: [] }; // Inicializa con una lista de imágenes
      }
      acc[row.pedido_id].imagenes.push({ url: row.url }); // Agrega la imagen
      return acc;
    }, {});

    return Object.values(pedidoData)[0]; // Devuelve el primer resultado de la agrupación
  } catch (error) {
    console.error("Error al obtener información del pedido:", error);
    throw new Error('Error al obtener la información del pedido');
  }
}



async function updatePedido(pedido_id, cliente_id, nombre, correo, area, mision, producto, cantidad, precio, reportado, entregado, incompleto, comentarios) {
  try {
    // Iniciar la transacción
    await pool.query('BEGIN');

    // Actualizar la tabla 'clientes'
    const updateClienteSql = `
      UPDATE public.clientes 
      SET nombre = $1, correo = $2, area = $3, mision = $4
      WHERE cliente_id = $5
    `;
    const updateClienteResult = await pool.query(updateClienteSql, [nombre, correo, area, mision, cliente_id]);

    // Actualizar la tabla 'pedidos'
    const updatePedidoSql = `
      UPDATE public.pedidos 
      SET producto = $1, cantidad = $2, precio = $3, reportado = $4, entregado = $5, incompleto = $6, comentarios = $7
      WHERE pedido_id = $8
    `;
    const updatePedidoResult = await pool.query(updatePedidoSql, [producto, cantidad, precio, reportado, entregado, incompleto, comentarios, pedido_id]);

    // Confirmar la transacción
    await pool.query('COMMIT');

    // Devuelve el resultado de las actualizaciones
    return {
      message: 'Pedido y cliente actualizados correctamente',
      clienteActualizado: updateClienteResult.rowCount,  // Número de filas actualizadas en 'clientes'
      pedidoActualizado: updatePedidoResult.rowCount     // Número de filas actualizadas en 'pedidos'
    };
  } catch (error) {
    // Revertir la transacción en caso de error
    await pool.query('ROLLBACK');
    console.error("Error al actualizar el pedido y cliente:", error);
    throw new Error('Error al actualizar el pedido y cliente');
  }
}


module.exports = {getPedidos, getPedidosInfoById, updatePedido};