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
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.accountView));
router.post("/q", utilities.checkLogin, utilities.handleErrors(accountController.accountView));






module.exports = router; 