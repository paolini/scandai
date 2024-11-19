import mongoose, {Types} from 'mongoose'

export interface IUser {
    _id: Types.ObjectId,
    name: string,
    username: string,
    email: string,
    isAdmin: boolean,
    isSuper: boolean,
    isViewer: boolean,
    isTeacher: boolean,
    isStudent: boolean,
    image: string,
    verified: boolean,
}

export interface IPostUser {
    name: string,
    username: string,
    email: string,
    isTeacher: boolean,
    isStudent: boolean,
    password?: string,
}

export interface IGetUser {
    _id: string,
    name: string,
    username: string,
    email: string,
    accounts: {provider: string}[],
    isAdmin: boolean,
    isSuper: boolean,
    isViewer: boolean,
    isTeacher: boolean,
    isStudent: boolean,
    image: string,
}

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
    },
    name: {
        type: String,
    },
    email: {
        type: String,
    },
    password: {
        type: String,
    },
    isTeacher: {
        type: Boolean,
        default: false,
    },
    isStudent: {
        type: Boolean,
        default: false,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    isSuper: {
        type: Boolean,
        default: false,
    },
    isViewer: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true
})

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)