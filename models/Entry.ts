import mongoose, {Types} from 'mongoose'

export type QuestionCode = string
export type LanguageAnswer = string[]
export type MapLanguageToCompetenceAnswer = {[key: string]: {[key: string]: string}}
export type MapLanguageToAgeAnswer = {[key: string]: string}
export type Answer = LanguageAnswer | MapLanguageToAgeAnswer | MapLanguageToCompetenceAnswer

export interface IEntry {
    _id: Types.ObjectId,
    pollId: Types.ObjectId,
    answers: {
        [key: QuestionCode]: Answer
    },
    lang: string,
    IP: string,
    clientTimestamp: number,
}

export interface IGetEntry {
    _id: string,
    pollId: string,
    poll: {
        _id: string,
        school_id: string,
        school: {
            _id: string,
            name: string,
            city: string,
        }
        form: string,
        class: string,
        year: string,
    }
    answers: {
        [key: QuestionCode]: Answer
    },
    lang: string,
    IP: string,
    clientTimestamp: number,
    createdAt: string,
}

const EntrySchema = new mongoose.Schema({
    pollId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Poll',
        required: true,
    },
    answers: {
        type: Object,
        required: true
    },
    lang: String,
    IP: String,
    clientTimestamp: Number,
}, {
    timestamps: true
})

export default mongoose.models.Entry || mongoose.model<IEntry>('Entry', EntrySchema)

