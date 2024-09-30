const invModel = require("../models/inventory-model")
const menuModel = require("../models/menu-model")
// const imagen = require("../public/images/Pedidos/IMG-HUTCHINGS-1.jpg")

const Util = {}
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a class = "nav_ul_li" href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += '<li >'
    list +=
      '<a class = "nav_ul_li"   href="/' +
      row.navigation_option +
      '" title="See our inventory of ' +
      row.navigation_option +
      ' vehicles">' +
      row.navigation_option  +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}


Util.logo = async function(req, res, next){

  let logo = "<a class='account-login-button' href='/account/login' title='Click to log in'>";
  logo += "<i class='fas fa-user profile-icon'></i>";
  logo += "</a>";

  return logo; 
}

Util.logoout = async function() {
  
  let logout = "<a class='account-logout-button' href='/account/logout' title='Click to log out'>";
  logout += "Logout"; // Aquí puedes personalizar el texto si es necesario
  logout += "</a>";

  return logout;
}




/* ****************************************
 *Build the view for for the pedidos info
**************************************** */
Util.singlePedido = async function(pedidoData) {
  let div = ""; // Inicializa div como una cadena vacía

  if (pedidoData) {
    div += '<div class="pedido-container">'; // Contenedor principal para el pedido
    div += '<div class="pedido-info">'; // Contenedor para la información del pedido
    div += `<p>Nombre: ${pedidoData.nombre}</p>`;
    div += `<p>Correo: ${pedidoData.correo}</p>`;
    div += `<p>Área: ${pedidoData.area}</p>`;
    div += `<p>Misión: ${pedidoData.mision}</p>`;
    div += `<p>Pedido ID: ${pedidoData.pedido_id}</p>`;
    div += `<p>Producto: ${pedidoData.producto}</p>`;
    div += `<p>Cantidad: ${pedidoData.cantidad}</p>`;
    div += `<p>Precio: $${new Intl.NumberFormat('es-ES').format(pedidoData.precio)}</p>`; // Formato del precio
    div += `<p>Fecha: ${new Date(pedidoData.fecha).toLocaleDateString('es-ES')}</p>`; // Formato de la fecha
    div += `<p>Reportado: ${pedidoData.reportado}</p>`;
    div += `<p>Entregado: ${pedidoData.entregado}</p>`;
    div += `<p>Incompleto: ${pedidoData.incompleto}</p>`;
    div += `<p>Comentarios: ${pedidoData.comentarios}</p>`;

    // Agrega el enlace para editar el pedido
    div += `<a href="/pedidos/editar-pedido/${pedidoData.pedido_id}" class="editar-link">Editar</a>`;
    
    div += '</div>'; // Cierra el contenedor de información
    div += `<div><p>Imágenes</p></div>`;

    // Verifica si hay imágenes definidas y si es un array con al menos un elemento
    if (pedidoData.imagenes && Array.isArray(pedidoData.imagenes) && pedidoData.imagenes.length > 0) {
      pedidoData.imagenes.forEach((img) => {
        div += `<img class="imgPedido" src="/images/Pedidos/${img.url}" alt="Imagen del pedido">`; // Fuente de la imagen
      });
    } else {
      div += `<p>No hay imágenes disponibles para este pedido.</p>`; // Mensaje si no hay imágenes
    }

    div += '</div>'; // Cierra el contenedor principal
  } else {
    div += '<p>No se encontraron pedidos.</p>'; // Mensaje si no hay datos
  }

  return div; // Devuelve el HTML construido
};









/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)


Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
   jwt.verify(
    req.cookies.jwt,
    process.env.ACCESS_TOKEN_SECRET,
    function (err, accountData) {
     if (err) {
      req.flash("Please log in")
      res.clearCookie("jwt")
      return res.redirect("/account/login")
     }
     res.locals.accountData = accountData
     res.locals.loggedin = 1
     next()
    })
  } else {
   next()
  }
}

Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
}



Util.checkAcess = (req, res, next) => {
  try {
    // Extract JWT token from request headers, cookies, or wherever it's stored
    const token = req.cookies.jwt; // Assuming JWT is stored in cookies

    // Check if token exists
    if (!token) {
      req.flash("error", "Unauthorized access. Please log in.");
      return res.redirect("/account/login");
    }

    // Verify JWT token
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Check account type
    if (decodedToken.account_type !== 'Employee' && decodedToken.account_type !== 'Admin') {
      res.clearCookie("jwt");
      req.flash("error", "Unauthorized access. You do not have permission to perform this action.");
      return res.redirect("/account/login");
    }

    // Allow access if account type is Employee or Admin
    next();
  } catch (error) {
    console.error(error);
    req.flash("error", "Unauthorized access. Please log in.");
    return res.redirect("/account/login");
  }
};


Util.logout = (req, res, next) => {
  if (res.locals.loggedin) {
    res.clearCookie("jwt");
    res.redirect("/account/login");
    req.flash("success", "Session successfully closed.");
  }
};



Util.editPedido = async function(pedidoData) {
  let form = ""; // Inicializa form como una cadena vacía

  if (pedidoData) {
    form += `<form class="pedido-container" action="/pedidos/editar-pedido/${pedidoData.pedido_id}" method="POST">`;
    
    // Campo oculto para el ID del pedido
    form += `<input type="hidden" name="pedido_id" value="${pedidoData.pedido_id}">`;

    form += '<div class="pedido-info">'; // Contenedor para la información del pedido

    // Campos del formulario para editar los valores del pedido
    form += `<label>Cliente_id: <input type="text" name="cliente_id" value="${pedidoData.cliente_id}"></label><br>`;
    form += `<label>Nombre: <input type="text" name="nombre" value="${pedidoData.nombre}"></label><br>`;
    form += `<label>Correo: <input type="email" name="correo" value="${pedidoData.correo}"></label><br>`;
    form += `<label>Área: <input type="text" name="area" value="${pedidoData.area}"></label><br>`;
    form += `<label>Misión: <textarea name="mision">${pedidoData.mision}</textarea></label><br>`;
    form += `<label>Producto: <input type="text" name="producto" value="${pedidoData.producto}"></label><br>`;
    form += `<label>Cantidad: <input type="number" name="cantidad" value="${pedidoData.cantidad}"></label><br>`;
    form += `<label>Precio: <input type="number" step="0.01" name="precio" value="${pedidoData.precio}"></label><br>`; // Formato del precio
    form += `<label>Fecha: <input type="date" name="fecha" value="${new Date(pedidoData.fecha).toISOString().split('T')[0]}"></label><br>`; // Formato de la fecha
    form += `<label>Reportado: <input type="text" name="reportado" value="${pedidoData.reportado}"></label><br>`;
    form += `<label>Entregado: <input type="text" name="entregado" value="${pedidoData.entregado}"></label><br>`;
    form += `<label>Incompleto: <input type="text" name="incompleto" value="${pedidoData.incompleto}"></label><br>`;
    form += `<label>Comentarios: <input type="text" name="comentarios" value="${pedidoData.comentarios}"></label><br>`;

    // Imágenes del pedido (solo mostrarlas, no editarlas en este formulario)
    // form += '<div><p>Imágenes</p></div>';
    // if (pedidoData.imagenes && Array.isArray(pedidoData.imagenes)) {
    //   pedidoData.imagenes.forEach((img) => {
        
    //     form += `<label><input type="text" name="imagenes" value="${img.url}"></label><br>`;
    //   });
    // }

    // Botón para enviar el formulario
    form += `<button type="submit">Guardar cambios</button>`;

    form += '</div>'; // Cierra el contenedor de información
    form += '</form>'; // Cierra el formulario principal
  // } else {
  //   form += '<p>No se encontraron pedidos.</p>'; // Mensaje si no hay datos
  }

  return form; // Devuelve el HTML del formulario construido
};

module.exports = Util