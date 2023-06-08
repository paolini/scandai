import mongoose, {Types} from 'mongoose'

console.log(`importing Class.js`)

export interface IClass {
    _id: Types.ObjectId,
    slug: string,
    school: string,
    class: string,
    hidden: boolean,
}

const ClassSchema = new mongoose.Schema({
    slug: {
        type: String,
        required: true,
    },
    school: {
        type: String,
        required: true,
    },
    class: {
        type: String,
        required: true,
    },
    hidden: {
        type: Boolean,
        default: false,
        required: true
    },
}, {
    timestamps: true
})

export default mongoose.models.Class || mongoose.model<IClass>('Class', ClassSchema)