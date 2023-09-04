import mongoose, {Types} from 'mongoose'

// Interfaccia per la creazione di un nuovo poll
export interface IPostSchool {
    name: string,
    city: string,
}

export interface IGetSchool extends IPostSchool {
    _id: string,
    pollCount: number,
    createdBy: {
        _id: string,
        name?: string,
        email?: string,
        image?: string,
        username?: string,
    },
    createdAt: string,
}

export interface ISchool extends IPostSchool {
    _id: Types.ObjectId,
    createdBy: Types.ObjectId,
}

const SchoolSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: false,
    },
}, {
    timestamps: true
})

export default mongoose.models.School || mongoose.model<ISchool>('School', SchoolSchema)