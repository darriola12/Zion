const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const menuModel = require("../models/menu-model")


const jwt = require("jsonwebtoken")
require("dotenv").config()
const bcrypt = require("bcryptjs")



/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/login", {
      title: "Login",
      nav,
      errors: null,
    })
}



/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/login", {
      title: "Login",
      nav,
    })
  }
}


/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
   req.flash("notice", "Please check your credentials and try again.")
   res.status(400).render("account/login", {
    title: "Login",
    nav,
    errors: null,
    account_email,
   })
  return
  }
  try {
   if (await bcrypt.compare(account_password, accountData.account_password)) {
   delete accountData.account_password
   const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })
   if(process.env.NODE_ENV === 'development') {
     res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
     } else {
       res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
     }
   return res.redirect("/account/")
   }
  } catch (error) {
   return new Error('Access Forbidden')
  }
 }
 

 async function accountView(req, res, next) {
  try {
    // Obtener el estado de inicio de sesión del cliente y establecer las variables en consecuencia
    const loggedin = res.locals.loggedin;
    const nav = await utilities.getNav();
    
    // Obtener el término de búsqueda, si existe
    const searchQuery = req.body.q || ''; // Cambié a cadena vacía si no hay búsqueda
    console.log(`Search query: ${searchQuery}`);
    
    // Obtener los datos de los pedidos
    const data = await menuModel.getPedidos(searchQuery);
    
    // Crear la tabla HTML
    let table = '<table class="table-pedidos">'; // Añade una clase específica
    table += '<thead class="table-header">';
    table += '<tr>';
    table += '<th class="table-cell">Nombre</th>';
    table += '<th class="table-cell">Correo</th>';
    table += '<th class="table-cell">Área</th>';
    table += '<th class="table-cell">Misión</th>';
    table += '<th class="table-cell">Pedido ID</th>';
    table += '</tr>';
    table += '</thead>';
    table += '<tbody class="table-body">';
    
    // Agregar filas a la tabla
    data.rows.forEach((row) => {
      table += '<tr class="table-row">';
      table += `<td class="table-cell">${row.nombre}</td>`;
      table += `<td class="table-cell">${row.correo}</td>`;  
      table += `<td class="table-cell">${row.area}</td>`;
      table += `<td class="table-cell">${row.mision}</td>`;
      table += `<td class="table-cell"><a class="table-link" href="/pedidos/pedido/${row.pedido_id}">${row.pedido_id}</a></td>`;
      table += '</tr>';
    });
    
    table += '</tbody>';
    table += '</table>';

    // Renderizar la vista
    res.render("account/main", {
      loggedin,
      title: `Bienvenido ${res.locals.accountData.account_firstname}`,
      nav,
      errors: null,
      menuPedidos: table, // Ahora pasa la tabla generada a la vista
    });
  } catch (error) {
    console.error("Error rendering account view:", error);
    return res.status(500).send("Internal Server Error");
  }
}






  
module.exports = { buildLogin, registerAccount, accountLogin, accountView}