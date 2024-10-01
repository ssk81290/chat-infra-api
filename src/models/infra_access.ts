// src/models/auth.ts
import mongoose, { Schema, Document } from 'mongoose';

// Enum for Access Status
const AccessStatusEnum = ['active', 'suspended'] as const;

// Interface for Auth Document
interface IAuth extends Document {
  cluster_id: mongoose.Types.ObjectId;
  cluster_num: string;
  access_key: string;
  access_name: string;
  access_num: string;
  access_scope: 'super' | 'app';
  status: typeof AccessStatusEnum[number];
  track: {
    added: Date;
    modified: Date;
    activated: Date;
    suspended: Date | null;
  };
}

// Auth Schema Definition
const authSchema: Schema = new Schema({
  cluster_id: { type: mongoose.Schema.Types.ObjectId, ref: 'col_cluster', required: true },
  cluster_num: { type: String, required: true },

  access_key: { type: String, required: true, maxlength: 20 }, // Random 20 char key
  access_name: { type: String, required: true },               // Super user or Landing Page name
  access_num: { type: String, required: true },                // Readable short slug

  access_scope: { type: String, enum: ['super', 'app'], required: true }, // Enumerated scope

  status: { type: String, enum: AccessStatusEnum, required: true, index: true }, // Access status

  track: {
    added: { type: Date, default: Date.now },                  // Date when access was added
    modified: { type: Date },                                  // Date when access was modified
    activated: { type: Date },                                 // Date when access was activated
    suspended: { type: Date, default: null }                   // Date when access was suspended (nullable)
  }
});

// Auth model
const Auth = mongoose.model<IAuth>('col_infra_access', authSchema);

export default Auth;
