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
module.exports = Data