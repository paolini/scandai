import mongoose, {Types} from 'mongoose'

// Interfaccia per la creazione di un nuovo poll
export interface IPostPoll {
    school_id: string,
    class: string,
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

export const POLL_PIPELINE = [
    { $lookup: {
        from: 'users',
        localField: 'createdBy',
        foreignField: '_id',
        as: 'createdByUser',
        pipeline: [
            { $project: {
                _id: 1,
                name: 1,
                email: 1,
                image: 1,
                username: 1,
            }}
        ]
    }},
    // createdByUser could be null if 
    // the user has been deleted
    {
        $addFields: {
            createdByUser: { $arrayElemAt: [ '$createdByUser', 0 ] }
        }
    },
    // add school information
    {
        $lookup: {
            from: "schools", // The name of the School collection
            localField: "school_id", // The field in the Poll collection
            foreignField: "_id", // The field in the School collection
            as: "school" // The field to store the matched school
        }
    },
    {
        $addFields: {
            school: { $arrayElemAt: [ "$school", 0 ] }
        }
    },
    // count the number of entries
    // related to the poll
    {
        $lookup: {
          from: "entries", // The name of the Entry collection
          localField: "_id", // The field in the Poll collection
          foreignField: "pollId", // The field in the Entry collection
          as: "entries" // The field to store the matched entries
        }
    },
    {
        $project: {
            _id: 1,
            school: 1,
            class: 1,
            form: 1,
            secret: 1,
            adminSecret: 1,
            createdAt: 1,
            createdBy: 1,
            createdByUser: 1,
            closedAt: 1,
            closed: 1,
            date: 1,
            entriesCount: { $size: "$entries" } // Calculate the size of the entryCount array
        }
    }            
]

