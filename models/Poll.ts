import mongoose, {Types} from 'mongoose'

// Interfaccia per la creazione di un nuovo poll
export interface IPostPoll {
    school: string,
    class: string,
    closed: boolean, 
}

export interface IGetPoll extends IPostPoll {
    _id: string,
    secret: string,
    entriesCount: number,
    date: string,
    createdBy: {
        _id: string,
        name?: string,
        email?: string,
        image?: string,
        username?: string,
    },
    createdAt: string,
}

export interface IPoll extends IPostPoll {
    _id: Types.ObjectId,
    secret: string,
    createdBy: Types.ObjectId,
}

const PollSchema = new mongoose.Schema({
    school: {
        type: String,
        required: true,
    },
    class: {
        type: String,
        required: true,
    },
    secret: {
        type: String,
        required: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,     
    },
    date: {
        type: Date,
        default: null,
    },
    closed: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true
})

export default mongoose.models.Poll || mongoose.model<IPoll>('Poll', PollSchema)