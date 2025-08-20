const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      require: true,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)
const users = mongoose.model('users', userSchema)
<<<<<<< HEAD
<<<<<<< HEAD
module.exports = users
=======
module.exports = users
>>>>>>> d0e8aa8 (Initial commit)
=======
module.exports = users
>>>>>>> 8a3eef7 (New)
