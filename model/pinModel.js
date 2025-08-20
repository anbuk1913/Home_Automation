const mongoose = require('mongoose')

const dataSchema = new mongoose.Schema(
  {
    pin:{
      type: Boolean,
      default: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

dataSchema.index({ createdAt: 1 })
const Data = mongoose.model('data', dataSchema)

<<<<<<< HEAD
<<<<<<< HEAD
module.exports = Data
=======
module.exports = Data
>>>>>>> d0e8aa8 (Initial commit)
=======
module.exports = Data
>>>>>>> 8a3eef7 (New)
