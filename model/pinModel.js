const mongoose = require('mongoose')

const pinSchema = new mongoose.Schema(
  {
    name:{
      type: String,
      required: true,
    },
    state:{
      type: Boolean,
      default: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'device'
    }
  },
  {
    timestamps: true,
  }
)

pinSchema.index({ createdAt: 1 })
const Pins = mongoose.model('pins', pinSchema)
module.exports = Pins