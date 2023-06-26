import mongoose, {Types} from 'mongoose'

export interface IUser {
    _id: Types.ObjectId,
    name: string,
    username: string,
    email: string,
    roles: string[],
    image: string,
}

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
    },
    email: {
        type: String,
    },
    password: {
        type: String,
    },
    roles: {
        type: [String],
    },
}, {
    timestamps: true
})

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)