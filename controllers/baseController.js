const utilities = require("../utilities/")
const baseController = {}

baseController.buildHome = async function(req, res){
  const nav = await utilities.getNav()
  const logo = await utilities.logo()
  res.render("index", {title: "Home", nav, logo})
  // req.flash("notice", "This is a flash message.")
}

module.exports = baseController