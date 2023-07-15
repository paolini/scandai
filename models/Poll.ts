import mongoose, {Types} from 'mongoose'

// Interfaccia per la creazione di un nuovo poll
export interface IPostPoll {
    school: string,
    class: string,
    closedAt: Date|null,
}

export interface IGetPoll extends IPostPoll {
    _id: string,
    secret: string,
    entriesCount: number,
    closedAt: Date,
    createdBy: {
        _id: string,
        name?: string,
        email?: string,
        image?: string,
        username?: string,
    },
    createdAt: Date,
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
    closedAt: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true
})

export default mongoose.models.Poll || mongoose.model<IPoll>('Poll', PollSchema)