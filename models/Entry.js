import mongoose from 'mongoose'

const EntrySchema = new mongoose.Schema({
    answers: {
        type: Object,
        required: true
    },
})

export default mongoose.models.Entry || mongoose.model('Entry', EntrySchema)