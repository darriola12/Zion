const express = require('express');
const router = new express.Router() 
const utilities = require("../utilities")
const accountController = require("../controllers/accountController")
const regValidate = require('../utilities/account-validation')




router.get("/login", utilities.handleErrors(accountController.buildLogin))
router.post(
    "/register",
    regValidate.registationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
)
router.post(
    "/login",
    regValidate.regLoginEmail(),
    regValidate.checkLoginEmail,
    utilities.handleErrors(accountController.accountLogin)
)
router.get("/", utilities.checkAcess, utilities.handleErrors(accountController.accountView));
router.post("/q", utilities.checkAcess, utilities.handleErrors(accountController.accountView));
router.get("/logout", utilities.logout )






module.exports = router; 