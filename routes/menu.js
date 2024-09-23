const express = require("express"); 
const router = new express.Router(); 
const utilities = require("../utilities/");
const pedidoController = require("../controllers/pedidoController")
const searchBar = require("../controllers/searchBarPedidos")

// Ruta para obtener información sobre un pedido específico
router.get("/pedido/:pedido_id", utilities.handleErrors(pedidoController.PedidosInfoView)); 


// Ruta para filtar y buscar la informacion por medio del search Bar 

// router.get("/?q", utilities.handleErrors(searchBar.)); 



module.exports = router; 
