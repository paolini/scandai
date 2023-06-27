import mongoose, {Types} from 'mongoose'

export interface IAccount {
    _id: Types.ObjectId,
    provider: string,
    type: string,
    providerAccountId: string,
    userId: Types.ObjectId,
}

const AccountSchema = new mongoose.Schema({
    provider: String,
    type: String,
    providerAccountId: String,
    userId: {
        type: Types.ObjectId,
        ref: 'User',
    },
})

export default mongoose.models.Account || mongoose.model<IAccount>('Account', AccountSchema)