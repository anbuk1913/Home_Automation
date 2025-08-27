const mongoose = require('mongoose')

const roomSchema = new mongoose.Schema(
  {
    name:{
      type: Boolean,
      default: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    pins: {
        type: Array,
    }
  },
  {
    timestamps: true,
  }
)

dataSchema.index({ createdAt: 1 })
const room = mongoose.model('room', roomSchema)
module.exports = room