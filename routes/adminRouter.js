const express = require('express')
const bodyParser = require('body-parser')
const adminAuth = require('../middleware/adminAuth')
const adminController = require('../controller/adminController')

const router = express.Router()

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))

router.get("/admin", adminController.adminLogin)
router.post("/adminVer", adminController.adminVerify)
router.get("/admin/users", adminAuth, adminController.userList)
router.put("/admin/edit/user", adminAuth, adminController.editUser)
router.post("/addclient", adminAuth, adminController.addNewClient)
router.get("/admin/requests", adminAuth, adminController.requestsPage)

module.exports = router