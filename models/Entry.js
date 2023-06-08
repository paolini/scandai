import mongoose from 'mongoose'

console.log(`importing Entry.js`)

const EntrySchema = new mongoose.Schema({
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true,
    },
    answers: {
        type: Object,
        required: true
    },
}, {
    timestamps: true
})

export default mongoose.models.Entry || mongoose.model('Entry', EntrySchema)