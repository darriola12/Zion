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
    div += '</div>'; // Cierra el contenedor de información

    // Agrega las imágenes
    if (pedidoData.imagenes && Array.isArray(pedidoData.imagenes)) {
      pedidoData.imagenes.forEach((img) => {
        div += `<img src="/images/Pedidos/${img.url}" alt="Imagen del pedido">`; // Fuente de la imagen
      });
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

module.exports = Util