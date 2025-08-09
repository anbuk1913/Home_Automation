const express = require('express')
const app = express()
const path = require('path')
const env = require('dotenv')
const session = require('express-session')
const userRouter = require('./routes/userRouter')

env.config()
require('./config/mongoDB')

app.use(express.json())
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store')
  next()
})

app.use(
  session({
    secret: process.env.SECRETKEY,
    resave: false,
    saveUninitialized: true,
  })
)

app.use(userRouter)


app.listen(process.env.PORT,() => {
    console.log("Server created")
}) 