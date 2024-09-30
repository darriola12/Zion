const express = require("express"); 
const router = new express.Router(); 
const utilities = require("../utilities/");
const pedidoController = require("../controllers/pedidoController")
const searchBar = require("../controllers/searchBarPedidos")

// Ruta para obtener información sobre un pedido específico
router.get("/pedido/:pedido_id", utilities.handleErrors(pedidoController.PedidosInfoView)); 
router.get("/editar-pedido/:pedido_id", utilities.handleErrors(pedidoController.editarPedido));
router.post("/editar-pedido/:pedido_id", utilities.handleErrors(pedidoController.updatePedido));





module.exports = router; 
