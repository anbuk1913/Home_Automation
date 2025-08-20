const express = require('express')
const app = express()
const path = require('path')
const env = require('dotenv').config()
const morgan = require('morgan')
const session = require('express-session')
const MongoStore = require("connect-mongo")
const userRouter = require('./routes/userRouter')
const adminRouter = require('./routes/adminRouter')

require('./config/mongoDB')

app.use(express.json())
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store')
  next()
})

app.use(morgan('dev'))

app.use(
  session({
    secret: process.env.SECRETKEY,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGOURL + "ImbedSoftware",
        ttl: 4 * 24 * 60 * 60, 
    }),
    cookie: { secure: false }
  })
)

app.use(userRouter)
app.use(adminRouter)

app.listen(process.env.PORT,() => {
    console.log("Server created")
})