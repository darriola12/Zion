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
    const loggedin = res.locals.loggedin;
    const logo = loggedin ? await utilities.logoout() : await utilities.logo();
    res.render("account/login", {
      title: "Login",
      nav,
      logo,
      errors: null,
    })
}



/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const loggedin = res.locals.loggedin;
  const logo = loggedin ? await utilities.logoout() : await utilities.logo();
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/login", {
      title: "Registration",
      nav,
      errors: null,
      logo
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
  const loggedin = res.locals.loggedin;
  const logo = loggedin ? await utilities.logoout() : await utilities.logo();
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
   req.flash("notice", "Please check your credentials and try again.")
   res.status(400).render("account/login", {
    title: "Login",
    nav,
    logo,
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
    const loggedin = res.locals.loggedin;
    const logo = loggedin ? await utilities.logoout() : await utilities.logo();
    const nav = await utilities.getNav();
    
    const searchQuery = req.body.q || ''; 
    console.log(`Search query: ${searchQuery}`);
    
    // Obtener los datos de los pedidos
    const data = await menuModel.getPedidos(searchQuery);
    
    // Agrupar los pedidos por cliente
    const groupedData = {};
    data.rows.forEach((row) => {
      const clienteKey = row.nombre; // Clave para agrupar por nombre
      if (!groupedData[clienteKey]) {
        // Si el cliente no está en el objeto, lo inicializamos
        groupedData[clienteKey] = {
          cliente_id: row.cliente_id,  // Asegurarte de que cliente_id se almacene aquí
          correo: row.correo,
          area: row.area,
          mision: row.mision,
          pedidoIds: []
        };
      }
      // Agregar el pedido_id al cliente correspondiente
      groupedData[clienteKey].pedidoIds.push(row.pedido_id);
    });

    // Crear la tabla HTML
    let table = '<table class="table-pedidos">';
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
    
    // Agregar filas a la tabla con los datos agrupados
    for (const cliente in groupedData) {
      const { cliente_id, correo, area, mision, pedidoIds } = groupedData[cliente];  // Asegurarte de extraer cliente_id aquí
      table += '<tr class="table-row">';
      table += `<td class="table-cell">${cliente}</td>`;
      table += `<td class="table-cell">${correo}</td>`;
      table += `<td class="table-cell">${area}</td>`;
      table += `<td class="table-cell">${mision}</td>`;
  
      // Crear enlaces individuales para cada pedido_id
      const pedidoLinks = pedidoIds.map(id => 
        `<a class="table-link" href="/pedidos/pedido/${id}">${id}</a>`
      ).join(', '); // Unir los enlaces en una cadena separada por comas

      table += `<td class="table-cell">${pedidoLinks}</td>`;
      // Añadir el botón o enlace "Añadir Pedido" correctamente con cliente_id
      table += '</tr>';
    }
    
    table += '</tbody>';
    table += '</table>';

    // Renderizar la vista
    res.render("account/main", {
      loggedin,
      title: `Bienvenido ${res.locals.accountData.account_firstname}`,
      nav,
      logo,
      errors: null,
      menuPedidos: table,
    });
  } catch (error) {
    console.error("Error rendering account view:", error);
    return res.status(500).send("Internal Server Error");
  }
}




  
module.exports = { buildLogin, registerAccount, accountLogin, accountView}