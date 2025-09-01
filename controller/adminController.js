const bcrypt = require('bcrypt')
const userCollection = require("../model/userModel")
const pinCollection = require("../model/pinModel")
const deviceCollection = require("../model/deviceModel")


async function encryptPassword(password) {
  const saltRounds = 10
  const hashedPassword = await bcrypt.hash(password, saltRounds)
  return hashedPassword
}

const adminLogin = async (req, res, next) => {
    try {
        let adminError = req.session.adminError;
        if (req.session.adminVer) {
            return res.redirect("/admin/users");
        } else {
            return res.render("admin/login", { adminError });
        }
    } catch (error) {
        console.log(error)
    }
};

const adminVerify = async (req, res, next) => {
    try {
        if (
            req.body.email === process.env.ADMIN_EMAIL &&
            req.body.password === process.env.ADMIN_PASS
        ) {
            req.session.adminVer = true;
            return res.redirect("/admin/users");
        } else {
            req.session.adminError = "Incorrect Email or Password";
            return res.redirect("/admin");
        }
    } catch (error) {
        console.log(error)
    }
};

const userList = async (req, res, next) => {
    try {
        let page = parseInt(req.query.page) || 1;
        let limit = 10;
        let skip = (page - 1) * limit;

        let searchQuery = req.query.search || "";
        let regexPattern = new RegExp(searchQuery, "i");

        let filter = searchQuery ? { $or: [{ name: regexPattern }, { email: regexPattern }] }: {}
        const users = await userCollection.aggregate([
        { $match: filter },
        {
            $lookup: {
            from: "devices",
            localField: "_id",
            foreignField: "userId",
            as: "devices",
            },
        },
        {
            $addFields: {
            deviceCount: { $size: "$devices" },
            },
        },
        {
            $project: {
            devices: 0,
            },
        },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },])

    const totalUsers = await userCollection.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / limit);

    return res.render("admin/userList", {
            users,
            page,
            totalPages,
            search: searchQuery,
        })
    } catch (error) {
        console.log(error)
    }
}

const editUser = async (req, res, next) => {
    try {
        const userExits = await userCollection.find({ email: req.body.email });
        if (userExits.length === 0 || req.body.userId == userExits[0]._id) {
            const update = await userCollection.updateOne(
                { _id: req.body.userId },
                {
                    name: req.body.name,
                    email: req.body.email,
                    phone: req.body.phone,
                    isActive: req.body.isActive,
                }
            );
            if (update.acknowledged) {
                return res.status(200).send({ ok: true });
            } else {
                return res.status(200).send({
                    ok: false,
                    type: "error",
                    title: "Error",
                    message: "Client details can't Update!",
                });
            }
        } else {
            return res.status(409).send({
                ok: false,
                type: "warning",
                title: "Warning",
                message: "Client email Already Exits!",
            });
        }
    } catch (error) {
        console.log(error)
    }
}

const addNewClient = async (req, res, next) => {
    try {
        const userExists = await userCollection.findOne({ email: req.body.email })
        if (userExists) {
            return res.status(409).send({
                ok: false,
                type: "warning",
                title: "Warning",
                message: "Client email already exists!",
            });
        }

        const hashedPassword = await encryptPassword(req.body.password);
        const status = req.body.status === "active";

        const newUser = new userCollection({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
            phone: req.body.phone,
            isActive: status,
        });

        const response = await newUser.save();

        if (response && response._id) {
            return res.status(200).send({ ok: true })
        } else {
            return res.status(200).send({
                ok: false,
                type: "error",
                title: "Error",
                message: "Can't add client, try again later!",
            });
        }
    } catch (error) {
        console.log(error)
    }
}

const singleUserView = async(req,res,next)=>{
    try {
        const {userid} = req.params
        const user = await userCollection.findById({ _id:userid })
        if(user){
            const rooms = await deviceCollection.find({ userId:userid }).populate('pins')
            return res.render('admin/singleUser',{ user, rooms })
        } else {
            return res.redirect("/admin/users")
        }
    } catch (error) {
        console.log(error)
    }
}


module.exports = { adminLogin,
    adminVerify,
    userList,
    editUser,
    addNewClient,
    singleUserView
};
