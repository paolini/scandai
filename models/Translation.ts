import mongoose, {Types} from 'mongoose'

export type IPostTranslation = {
    [key: string]: {
        it?: string,
        en?: string,
        fu?: string,
    }
}

export type IGetTranslation = IPostTranslation

export type ITranslation = {
    _id: Types.ObjectId,
    source: string,
    map: {
        it?: string,
        en?: string,
        fu?: string,
    },
}

const TranslationSchema = new mongoose.Schema({
    source: {
        type: String,
        required: true,
    },
    map: {
        type: Map,
        of: String,
        required: true,
    },
}, {
    timestamps: true
})

export default mongoose.models.Translation || mongoose.model<ITranslation>('Translation', TranslationSchema)