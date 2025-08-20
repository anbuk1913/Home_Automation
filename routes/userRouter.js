const express = require('express')
const bodyParser = require('body-parser')
const passport = require('../config/passport')
const userAuth = require('../middleware/userAuth')
const userController = require('../controller/userController')

const router = express.Router()

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))

// router.get("/", userController)
router.get("/login", userController.loginPage)
router.post("/login", userController.loginPost)
router.get('/auth/google',passport.authenticate('google', { scope: ['email', 'profile'] }))
router.get('/auth/google/callback',passport.authenticate('google', {failureRedirect: 'http://localhost:1913/login',}),userController.googleCallback)

module.exports = router
