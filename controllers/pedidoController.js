const utilities = require("../utilities")
const accountModel = require("../models/menu-model")




async function PedidosInfoView(req, res, next){

    let nav =await utilities.getNav()
    const pedido_id = req.params.pedido_id
    const data = await accountModel.getPedidosInfoById(pedido_id)
    const div = await utilities.singlePedido(data)
    res.render("account/pedido",{
        title: "Pedidos info",
        nav,
        errors:null,
        div

    })


}

module.exports = {PedidosInfoView}






