const mongoose = require('mongoose')

const counterSchema = new mongoose.Schema(
    {
        key: { type: String, required: true, unique: true, index: true },
        value: { type: Number, default: 1000 },
    },
    { timestamps: true }
)

module.exports = mongoose.model('Counter', counterSchema)