const express = require('express')
const bodyParser = require('body-parser')
const userController = require('../controller/userController')

const router = express.Router()

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))

router.get("/", userController.homePage)
router.post("/data",userController.receivedData)

module.exports = router
