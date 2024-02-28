import mongoose, {Types} from 'mongoose'

// Interfaccia per la creazione di un nuovo poll
export interface IPostSchool {
    name: string,
    city: string,
    city_fu: string,
    reportSecret?: string,
}

export interface IGetSchool extends IPostSchool {
    _id: string,
    pollCount: number,
}

export interface ISchool extends IPostSchool {
    _id: Types.ObjectId,
}

const SchoolSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        default: '',
    },
    city: {
        type: String,
        required: true,
        default: '',
    },
    city_fu: {
        type: String,
        required: true,
        default: '',
    },
    reportSecret: {
        type: String,
        required: false,
        default: '',
    },
}, {
    timestamps: true
})

export default mongoose.models.School || mongoose.model<ISchool>('School', SchoolSchema)