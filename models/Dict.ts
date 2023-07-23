import mongoose, {Types} from 'mongoose'

export interface IPostDict {
    lang: string,
    map: string,
}

export interface IDict extends IPostDict {
    _id: Types.ObjectId,
}

const DictSchema = new mongoose.Schema({
    lang: {
        type: String,
        required: true,
    },
    map: {
        type: String,
        required: false,
    },
}, {
    timestamps: true
})

export default mongoose.models.Dict || mongoose.model<IDict>('Dict', DictSchema)