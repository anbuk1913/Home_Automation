const bcrypt = require('bcrypt')
const dataCollection = require('../model/pinModel')
const userCollection = require('../model/userModel')

async function encryptPassword(password) {
  const saltRounds = 10
  const hashedPassword = await bcrypt.hash(password, saltRounds)
  return hashedPassword
}

async function comparePassword(enteredPassword, storedPassword) {
  const isMatch = await bcrypt.compare(enteredPassword, storedPassword)
  return isMatch
}

const loginPage = async(req,res,next)=>{
    try {
        if(req.session.login){
            return res.redirect("/")
        } else {
            return res.render("user/login")
        }
    } catch (error) {
        console.log(error)
    }
}

const loginPost = async(req,res,next)=>{
    try {
        const userData = await userCollection.findOne({ email: req.body.email})
        if(userData && userData.password && (await comparePassword(req.body.password, userData.password))){
            req.session.login = true
            req.session.userId = userData._id
            return res.status(200).send({ success: true })
        } else {
            return res.status(208).send({ success: false })
        }
    } catch (error) {
        console.log(error)
    }
}

module.exports = { loginPage, loginPost }