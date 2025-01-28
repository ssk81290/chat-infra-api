import { Schema, Document, Model, Connection} from 'mongoose';

interface IAIPlatform extends Document {
  platform: string;      // Full name of the AI platform
  abbr: string;          // Abbreviation for the platform
  access_key: string;    // Access key for the platform services
}

const aiPlatformSchema: Schema = new Schema({
  platform: { type: String, required: true, unique: true, index: true },
  abbr: { type: String, required: true, unique: true, index: true },
  access_key: { type: String, required: true },
}, { versionKey: false });

export const createAIPlatform = (connection:Connection) => {
  return connection.model<IAIPlatform>('AIPlatform', aiPlatformSchema, 'col_ai_platforms');
};
