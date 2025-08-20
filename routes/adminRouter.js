const express = require('express')
const bodyParser = require('body-parser')
const adminAuth = require('../middleware/adminAuth')
const adminController = require('../controller/adminController')

const router = express.Router()

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))

router.get("/admin", adminController.adminLogin)
router.post("/adminVer", adminController.adminVerify)
router.get("/admin/dashboard", adminAuth, adminController.adminDasboard)

module.exports = router