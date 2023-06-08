import mongoose, {Types} from 'mongoose'

export interface IEntry {
    _id: Types.ObjectId,
    classId: Types.ObjectId,
    answers: Object,
}

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

export default mongoose.models.Entry || mongoose.model<IEntry>('Entry', EntrySchema)