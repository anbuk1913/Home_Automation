const bcrypt = require('bcrypt')
const pinCollections = require('../model/pinModel')
const userCollection = require('../model/userModel')
const deviceCollection =require('../model/deviceModel')
const sendotp = require('../helper/sendOtp')
const otpCollection = require('../model/otpModel')
const AppError = require('../middleware/errorHandling')

async function encryptPassword(password) {
  const saltRounds = 10
  const hashedPassword = await bcrypt.hash(password, saltRounds)
  return hashedPassword
}

async function comparePassword(enteredPassword, storedPassword) {
  const isMatch = await bcrypt.compare(enteredPassword, storedPassword)
  return isMatch
}

const homePage = async(req,res,next)=>{
    try {
        let user = null
        if(req.session.login){
            const client = await userCollection.findById({ _id : req.session.userId })
            let user = { name : client.name, picture : client.picture}
            return res.render("user/home",{ user })
        }
        return res.render("user/home",{ user })
    } catch (error) {
        console.log(error)
        next(new AppError('Sorry...Something went wrong', 500))
    }
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
        next(new AppError('Sorry...Something went wrong', 500))
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
        next(new AppError('Sorry...Something went wrong', 500))
    }
}

const googleCallback = async(req,res,next)=>{
    try {
        if(req.session.login){
            return res.redirect("/")
        }
        const user = await userCollection.findOne({email:req.user.email})
        if(user){
            req.session.login = true
            req.session.userId = user._id
            return res.redirect("/")
        } else {
            const newUser = await userCollection.insertOne({
                name : req.user.name,
                email : req.user.email,
                isActive : true,
                picture : req.user.picture
            })
            req.session.login = true
            req.session.userId = newUser._id
            return res.redirect("/")
        }
    } catch (error) {
        console.log(error)
        next(new AppError('Sorry...Something went wrong', 500))
    }
}

const signupPage = async(req,res,next)=>{
    try {
        if(req.session.login){
            return res.redirect("/")
        } else {
            return res.render("user/signup")
        }
    } catch (error) {
        console.log(error)
        next(new AppError('Sorry...Something went wrong', 500))
    }
}

const signupPost = async(req,res,next)=>{
    try {
        const userExists = await userCollection.findOne({ email: req.body.email })
        if (userExists) {
            return res.status(409).send({ success: false })
        } else {
            const hashedPassword = await encryptPassword(req.body.password)
            const user = new userCollection({
                name: req.body.username,
                email: req.body.email,
                phone: req.body.phone,
                password: hashedPassword,
            })
            req.session.user = user
            return res.status(200).send({ success: true })
        }
    } catch (error) {
        console.log(error)
        next(new AppError('Sorry...Something went wrong', 500))
    }
}

const sendOtp = async(req,res,next)=>{
    try {
        req.session.otpSession = true
        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString()
        req.session.otpError = null
        req.session.otpTime = 75 // Set it only if it's not already set
        sendotp(generatedOtp, req.session.user.email, req.session.user.name)
        const hashedOtp = await encryptPassword(generatedOtp)
        await otpCollection.updateOne(
        { email: req.session.user.email },
        { $set: { otp: hashedOtp } },
        { upsert: true }
        )
        req.session.otpStartTime = null
        res.redirect('/otp')
    } catch (error) {
        console.log(error)
        next(new AppError('Sorry...Something went wrong', 500))
    }
}

const otpPage = async(req,res,next)=>{
    try {
        if (req.session.otpSession) {
            const otpError = req.session.otpError
            // If OTP time isn't set, set it
            if (!req.session.otpStartTime) {
            req.session.otpStartTime = Date.now()
            }
            const elapsedTime = Math.floor(
            (Date.now() - req.session.otpStartTime) / 1000
            )
            const remainingTime = Math.max(req.session.otpTime - elapsedTime, 0)
            return res.render('user/otp', { otpError: otpError, time: remainingTime })
        } else {
            return res.redirect('/')
        }
    } catch (error) {
        console.log(error)
        next(new AppError('Sorry...Something went wrong', 500))
    }
}

const otpPost = async(req,res,next)=>{
    try {
        const findOtp = await otpCollection.findOne({ email: req.session.user.email })
        if (await comparePassword(req.body.otp, findOtp.otp)) {
            const user = new userCollection({
                name: req.session.user.name,
                email: req.session.user.email,
                phone: req.session.user.phone,
                password: req.session.user.password,
            })
            req.session.userId = user._id
            req.session.user = null
            await user.save()
            req.session.login = true
            req.session.otpSession = false
            res.redirect('/')
        } else {
            req.session.otpError = 'Incorrect OTP'
            res.redirect('/otp')
        }
    } catch (error) {
        console.log(error)
        next(new AppError('Sorry...Something went wrong', 500))
    }
}


const getdata = async(req,res,next)=>{
    try {
        const { userid, roomid } = req.params
        const user = await userCollection.findById({ _id:userid })
        if(user){
            const room =  await deviceCollection.findById({ _id: roomid}).populate('pins')
            if(String(user._id) == String(room.userId)){
                return res.status(200).json({ success: true, room })
            } else {
                return res.status(409).json({ success: false, message: "Unauthorized request!"})
            }
        } else {
            return res.status(403).json({
                success : false,
                message : "User Not Found"
            })
        }
    } catch (error) {
        console.log(error)
        next(new AppError('Sorry...Something went wrong', 500))
    }
}


const logout = async(req,res,next)=>{
    try {
        req.session.login = null
        req.session.userId = null
        return res.redirect("/")
    } catch (error) {
        console.log(error)
        next(new AppError('Sorry...Something went wrong', 500))
    }
}

const fogetPasswordPage = async(req,res,next)=>{
    try {
        if(req.session.login){
            return res.redirect('/')
        } else {
            return res.render('user/forgetPasswordEmail')
        }
    } catch (error) {
        console.log(error)
        next(new AppError('Sorry...Something went wrong', 500))
    }
}

const emailCheck = async (req, res, next) => {
    try {
        const user = await userCollection.findOne({ email: req.body.email })
        if (user) {
        const pass = req.body.password
        const newPassword = await encryptPassword(pass)
        req.session.user = {
            name: user.name,
            email: user.email,
            newPassword,
        }
        return res.status(200).send({ success: true })
        } else {
        return res.status(200).send({ success: false })
        }
    } catch (error) {
        console.log(error)
        next(new AppError('Sorry...Something went wrong', 500))
    }
}

const forgetPassOtpSend = async (req, res, next) => {
    try {
        req.session.otpSession = true
        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString()
        req.session.otpError = null
        req.session.otpTime = 75 // Set it only if it's not already set
        sendotp(generatedOtp, req.session.user.email, req.session.user.name)
        const hashedOtp = await encryptPassword(generatedOtp)
        await otpCollection.updateOne(
            { email: req.session.user.email },
            { $set: { otp: hashedOtp, password: req.session.user.newPassword } },
            { upsert: true }
        )
        req.session.otpStartTime = null
        res.redirect('/forget-password-opt')
    } catch (error) {
        console.log(error)
        next(new AppError('Sorry...Something went wrong', 500))
    }
}

const forgototpPage = async (req, res, next) => {
    try {
        if (req.session.otpSession) {
            const otpError = req.session.otpError
            // If OTP time isn't set, set it
            if (!req.session.otpStartTime) {
            req.session.otpStartTime = Date.now()
            }
            const elapsedTime = Math.floor(
            (Date.now() - req.session.otpStartTime) / 1000
            )
            const remainingTime = Math.max(req.session.otpTime - elapsedTime, 0)
            return res.render('user/forgetOtpPage', {
            otpError: otpError,
            time: remainingTime,
            })
        } else {
            return res.redirect('/')
        }
    } catch (error) {
        console.log(error)
        next(new AppError('Sorry...Something went wrong', 500))
    }
}

const forgetOtpPost = async (req, res, next) => {
    try {
        const findOtp = await otpCollection.findOne({ email: req.session.user.email })
        if (await comparePassword(req.body.otp, findOtp.otp)) {
            await usercollection.updateOne(
            { email: req.session.user.email },
            { password: findOtp.password }
            )
            req.session.signupSession = true
            req.session.otpError = null
            res.redirect('/')
        } else {
            req.session.otpError = 'Incorrect OTP'
            res.redirect('/forget-password-opt')
        }
    } catch (error) {
        console.log(error)
        next(new AppError('Sorry...Something went wrong', 500))
    }
}

module.exports = {
    homePage,
    loginPage,
    loginPost,
    googleCallback,
    signupPage,
    signupPost,
    sendOtp,
    otpPage,
    otpPost,
    getdata,
    fogetPasswordPage,
    emailCheck,
    forgetPassOtpSend,
    forgototpPage,
    forgetOtpPost,
    logout
}