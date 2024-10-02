const utilities = require("../utilities")
const accountModel = require("../models/menu-model")




async function PedidosInfoView(req, res, next){

    let nav =await utilities.getNav()
    const loggedin = res.locals.loggedin;
    const pedido_id = req.params.pedido_id
    const data = await accountModel.getPedidosInfoById(pedido_id)
    const div = await utilities.singlePedido(data)
    const logo = loggedin ? await utilities.logoout() : await utilities.logo();
    res.render("account/pedido",{
        loggedin,
        title: "Pedidos info",
        nav,
        logo,
        errors:null,
        div

    })


}


async function editarPedido(req, res, next) {

    let nav =await utilities.getNav()
    const loggedin = res.locals.loggedin;
    const pedido_id = req.params.pedido_id
    const logo = loggedin ? await utilities.logoout() : await utilities.logo();
    const data =  await accountModel.getPedidosInfoById(pedido_id)
    const form = await utilities.editPedido(data);
    res.render("account/editarPedido",{
        loggedin,
        title: "Editar Pedido",
        nav,
        logo,
        errors:null,
        form

    })



    
}


async function updatePedido(req, res, next) {
    const { cliente_id, nombre, correo, area, mision, producto, cantidad, precio, reportado, entregado, incompleto, comentarios } = req.body;
    const pedido_id = req.params.pedido_id;

    // Llama a la función para actualizar el pedido
    await accountModel.updatePedido(pedido_id, cliente_id, nombre, correo, area, mision, producto, cantidad, precio, reportado, entregado, incompleto, comentarios);

    // Redirige a la vista que muestra la información del pedido actualizado
    res.redirect(`/pedidos/pedido/${pedido_id}`);
}

// async function añadirPedidoView(){

    
    


// }


module.exports = {PedidosInfoView, editarPedido, updatePedido}






