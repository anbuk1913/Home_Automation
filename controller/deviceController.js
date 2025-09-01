const pinCollection = require('../model/pinModel')
const userCollection = require('../model/userModel')
const deviceCollection =require('../model/deviceModel')
const AppError = require('../middleware/errorHandling')


const devicePage = async (req,res,next)=>{
    try {
        const user = await userCollection.findOne({ _id:req.session.userId })
        const rooms = await deviceCollection.find({ userId : req.session.userId }).populate('pins')
        return res.render('user/device',{ user, rooms })
    } catch (error) {
        console.log(error)
        next(new AppError('Sorry...Something went wrong', 500))
    }
}

const roomPage = async (req,res,next)=>{
    try {
        const roomId = req.params.roomid
        const user = await userCollection.findOne({ _id:req.session.userId })
        const room = await deviceCollection.findById({ _id: roomId}).populate('pins')
        if(String(room.userId) === String(req.session.userId)){
            return res.render('user/room',{ user, room})
        } else {
            res.end("Dont try to enter another Room")
        }
    } catch (error) {
        console.log(error)
        next(new AppError('Sorry...Something went wrong', 500))
    }
}

const requestBoard = async (req,res,next)=>{
    try {
        const updatedUser = await userCollection.findOneAndUpdate(
            { _id: req.session.userId },
            { $set: { request: true } },
            { returnDocument: 'after' }
        )
        if(updatedUser){
            return res.status(200).send({ success: true })
        } else {
            return res.status(200).send({ success: false })
        }
    } catch (error) {
        console.log(error)
        next(new AppError('Sorry...Something went wrong', 500))
    }
}

const requestsPage = async (req,res,next)=>{
    try {
        let page = parseInt(req.query.page) || 1;
        let limit = 10;
        let skip = (page - 1) * limit;

        let searchQuery = req.query.search || "";
        let regexPattern = new RegExp(searchQuery, "i");

        let filter = { request: true };

        if (searchQuery) {
            filter.$or = [
                { name: regexPattern },
                { email: regexPattern }
            ];
        }

        const users = await userCollection
            .find(filter)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const totalUsers = await userCollection.countDocuments({ request: true})
        const totalPages = Math.ceil(totalUsers / limit);
        return res.render("admin/requests", {
            users,
            page,
            totalPages,
            search: searchQuery,
        })
    } catch (error) {
        console.log(error)
        next(new AppError('Sorry...Something went wrong', 500))
    }
}

const addNewDevice = async (req,res,next)=>{
    try {
        let totalDevice = await deviceCollection.countDocuments({ userId: req.body._id })
        const newRoom = new deviceCollection({
            name : `Room - ${totalDevice}`,
            userId : req.body._id,
        })
        const response = await newRoom.save();
        if (response && response._id) {
            let tem = []
            for(let i=1;i<=10;i++){
                tem.push({
                    name : `Pin-${i}`,
                    state : false,
                    userId : req.body._id,
                    roomId : response._id
                })
            }
            let insert = await pinCollection.insertMany(tem)
            if(insert){
                let pinId = []
                let insertedPins = insert.insertedCount
                for(let i of insert){
                    pinId.push(i._id)
                }
                let result = await deviceCollection.updateOne({ _id : response._id },{ $set: { pins: pinId } })
                if(result.acknowledged){
                    await userCollection.updateOne({ _id: req.body._id } , { $set: { request: false } } )
                    return res.status(200).send({
                        ok: true,
                        pins: pinId,
                        type: 'success',
                        title: "Success",
                        message: `Successfully ${insertedPins} pins Created.`,
                        roomId: response._id
                    })
                } else {
                    return res.status(409).send({ 
                        ok: false,
                        pins: pinId,
                        type: 'info',
                        title: "OOPS!",
                        message: `Cannot Create Pins in Database`,
                        roomId: response._id
                    })
                }
            } else {
                return res.status(409).send({
                    ok: false,
                    type: 'warning',
                    title: "OOPS!",
                    message: `Cannot Connect Pins in Database`,
                    roomId: response._id
                })
            }
        } else {
            return res.status(409).send({ 
                ok: false,
                type: 'error',
                title: "OOPS!",
                message: `Cannot Create Device in Database`
            })
        }
    } catch (error) {
        console.log(error)
        next(new AppError('Sorry...Something went wrong', 500))
    }
}

const rejectRequest = async (req,res,next)=>{
    try {
        const result = await userCollection.updateOne({ _id: req.body._id } , { $set: { request: false } } )
        if(result.acknowledged){
            return res.status(200).send({ ok: true, message: `Successfully Client's Request Rejected.` })
        } else {
            return res.status(409).send({ ok: false, message: `Cannot Reject Client's Request.` })
        }
    } catch (error) {
        console.log(error)
        next(new AppError('Sorry...Something went wrong', 500))
    }
}

const togglePin = async (req,res,next)=>{
    try {
        const { pinId } = req.params
        const { currentState } = req.body
        
        const pin = await pinCollection.findById(pinId);
        if (!pin) {
            return res.status(409).json({ message: 'Pin not found' });
        }
        
        if (String(pin.userId) !== String(req.session.userId)) {
            return res.status(409).json({ message: 'Unauthorized' })
        }
        
        pin.state = !currentState
        await pin.save()
        
        res.status(200).json({
            success: true,
            state: pin.state,
            pinName: pin.name
        })
    } catch (error) {
        console.log(error)
        next(new AppError('Sorry...Something went wrong', 500))
    }
}

const editRoom = async (req,res,next)=>{
    try {
        const { roomId } = req.params
        const { roomName, pins } = req.body
        
        const room = await deviceCollection.findById(roomId)
        if (String(room.userId) !== String(req.session.userId)) {
            return res.status(403).json({ message: 'Unauthorized' })
        }
        room.name = roomName
        await room.save()
        for (const pinUpdate of pins) {
            await pinCollection.findByIdAndUpdate(pinUpdate.pinId, { name: pinUpdate.name });
        }
        res.json({ success: true, message: 'Room updated successfully' })
    } catch (error) {
        console.log(error)
        next(new AppError('Sorry...Something went wrong', 500))
    }
}

const editPin = async (req,res,next)=>{
    try {
        const { pinId } = req.params
        const { name } = req.body

        const pin = await pinCollection.findById(pinId)
        if (String(pin.userId) !== String(req.session.userId)){
            return res.status(403).json({ message: 'Unauthorized' })
        }
        pin.name = name
        await pin.save()
        res.json({ success: true, pinName: name })
    } catch (error) {
        console.log(error)
        next(new AppError('Sorry...Something went wrong', 500))
    }
}

module.exports = {
    devicePage,
    roomPage,
    requestBoard,
    requestsPage,
    addNewDevice,
    rejectRequest,
    togglePin,
    editRoom,
    editPin,
}
