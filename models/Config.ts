import mongoose, {Document, Schema} from 'mongoose'

export interface IGetConfig {
    siteTitle: {
        en: string;
        fu: string;
        it: string;
    }
}

export interface IConfig extends Document, IGetConfig {}

const ConfigSchema = new Schema({
    siteTitle: {
        en: { type: String, required: true },
        fu: { type: String, required: true },
        it: { type: String, required: true },
    },
})

export default mongoose.models.Config || mongoose.model<IConfig>('Config', ConfigSchema)
