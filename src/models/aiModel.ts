import { Schema, Document, Model, Connection } from 'mongoose';

interface IAIModel extends Document {
  model: string;          // Unique name of the AI Model
  variants: string[];     // Variants of the model
  type: string;           // Type of model, e.g., 'llm', 'embed'
  description: string;    // Description of the AI Model
  status: string;         // Status of the model, e.g., 'suspended', 'active'
  platforms: string[];    // Platforms supporting this model
  platform: string;       // Default platform abbreviation
  default: boolean;       // Whether it's the default model for new bots
}

const aiModelSchema: Schema = new Schema({
  model: { type: String, required: true, unique: true, index: true },
  variants: { type: [String], default: [] },
  type: { type: String, required: true, enum: ['llm', 'embed'], index: true },
  description: { type: String, required: true },
  status: { type: String, required: true, enum: ['suspended', 'active'], index: true },
  platforms: { type: [String], default: [] },
  platform: { type: String, required: true },
  default: { type: Boolean, required: true, index: true },
}, { versionKey: false });

export const createAIModel = (connection: Connection) => {
  return connection.model<IAIModel>('AIModel', aiModelSchema,'col_ai_models');
};


  