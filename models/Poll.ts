import mongoose, {Types} from 'mongoose'

// Interfaccia per la creazione di un nuovo poll
export interface IPostPoll {
    school_id: string,
    class: string,
    year: string,
    form: string,
    closed: boolean, 
}

export interface IGetPoll extends IPostPoll {
    _id: string,
    secret: string,
    adminSecret?: string,
    entriesCount: number,
    date: string,
    school?: {
        _id: string,
        name: string,
        city: string,
        city_fu: string,
    }
    createdBy: string,
    createdByUser: {
        _id: string,
        name?: string,
        email?: string,
        image?: string,
        username?: string,
    },
    createdAt: string,
}

export interface IPoll {
    _id: Types.ObjectId,
    school_id: Types.ObjectId,
    class: string,
    year: string,
    form: string,
    closed: boolean, 
    secret: string,
    adminSecret?: string,
    createdBy: Types.ObjectId,
    createdAt: string,
}

const PollSchema = new mongoose.Schema({
    school_id: {
        type: Types.ObjectId,
        ref: 'School',
        required: true,
    },
    class: {
        type: String,
        required: true,
    },
    year: {
        type: String,
        required: true,
        choices: ["", "1", "2", "3", "4", "5"],
        default: "",
    },
    form: {
        type: String,
        required: true,
    },
    secret: {
        type: String,
        required: true,
    },
    adminSecret: {
        type: String,
        required: false,
    },
    createdBy: {
        type: Types.ObjectId,
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


