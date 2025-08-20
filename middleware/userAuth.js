const userCollection = require('../model/userModel')

module.exports = async function (req,res,next){
    try {
        if(req.session.login){
            const user = await userCollection.findOne({
                _id : req.session.userId
            })
            if(!user.isActive){
                return res.send("User Blocked")
            } else {
                next()
            }
        } else {
            return res.redirect('/')
        }
    } catch (error) {
        console.log(error)
    }
}