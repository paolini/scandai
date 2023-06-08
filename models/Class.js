import mongoose from 'mongoose'

console.log(`importing Class.js`)

const ClassSchema = new mongoose.Schema({
    slug: {
        type: String,
    },
    school: {
        type: String,
    },
    class: {
        type: String,
    },
    hidden: {
        type: Boolean,
        default: false,
        required: true
    },
}, {
    timestamps: true
})

export default mongoose.models.Class || mongoose.model('Class', ClassSchema)