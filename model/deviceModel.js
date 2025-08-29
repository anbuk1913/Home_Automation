const mongoose = require('mongoose')

const deviceSchema = new mongoose.Schema(
  {
    name:{
        type: String,
        default: false,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },
    pins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'pins',
      }
    ]
  },
  {
    timestamps: true,
  }
)

deviceSchema.index({ createdAt: 1 })
const device = mongoose.model('device', deviceSchema)
module.exports = device