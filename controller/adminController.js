const adminLogin = async(req,res,next)=>{
    try {
        let adminError = req.session.adminError
        if(req.session.adminVer){
            return res.redirect("/admin/dashboard")
        } else {
            return res.render('admin/login',{adminError})
        }
    } catch (error) {
        console.log(error)
    }
}

const adminVerify = async(req,res,next)=>{
    try {
        if(req.body.email === process.env.ADMIN_EMAIL && req.body.password === process.env.ADMIN_PASS){
            return res.redirect("/admin/dashboard")
        } else {
            req.session.adminError = "Incorrect Email or Password"
            return res.redirect('/admin')
        }
    } catch (error) {
        console.log(error)
    }
}

const adminDasboard = async(req,res,next)=>{
    try {
        return res.render("admin/dashboard")
    } catch (error) {
        console.log(error)
    }
}

module.exports = { adminLogin, adminVerify, adminDasboard }