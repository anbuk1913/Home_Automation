const data = require('../model/pinModel')

const homePage = async (req,res,next)=>{
    try {
        const readings = await data.find({}).sort({ createdAt: 1 }).lean();
        const latest = readings[readings.length - 1] || { temperature: 0, humidity: 0 };
        return res.render('home',{
            temperature: latest.temperature??0,
            humidity: latest.humidity??0,
            historicaldata: readings.map(r => ({
                time: new Date(r.createdAt).toLocaleTimeString(),
                temperatureC: r.temperature,
                humidity: r.humidity
            }))
        })
    } catch (error) {
        console.log(error)
    }
}

const receivedData = async(req,res,next)=>{
    try {
        console.log('Data received:', req.body)
        const datas = new data({
            temperature: req.body.temperature,
            humidity: req.body.humidity
        })
        datas.save()
        return res.status(200).send('Data received')
    } catch (error) {
        console.log(error)
    }
}

module.exports = { homePage, receivedData }