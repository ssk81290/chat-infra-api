// src/models/account.ts
import mongoose, {Connection,  Document, Schema } from 'mongoose';

// Interface for the Account
interface IAccount extends Document {
  cluster_id: mongoose.Types.ObjectId;
  cluster_num: string;
  access_id: mongoose.Types.ObjectId;
  access_num: string;
  customer_id: string;
  account_num: string;
  account_name: string;
  status: string;
  chatbot: {
    unlimited: boolean;
    max_allowed: number;
    zones: string[];
  };
  track: {
    added: Date;
    modified: Date;
    activated: Date;
    suspended: Date;
  };
}

// Account schema
const accountSchema: Schema = new mongoose.Schema({
  cluster_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Cluster' },
  cluster_num: { type: String, required: true, ref: 'Cluster' },
  access_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Auth' },
  access_num: { type: String, required: true, ref: 'Auth' },
  customer_id: { type: String, required: true },
  account_num: { type: String, required: true, unique: true, index: true },
  account_name: { type: String, required: true, index: true },
  status: { type: String, required: true, index: true },
  chatbot: {
    unlimited: { type: Boolean, default: false },
    max_allowed: { type: Number, default: 0 },
    zones: { type: [String], default: [] }
  },
  track: {
    added: { type: Date, default: Date.now },
    modified: { type: Date, default: Date.now },
    activated: { type: Date },
    suspended: { type: Date }
  }
});



export const createAccountModel = (connection: Connection) => {
  return connection.model<IAccount>("Account", accountSchema, 'col_accounts');
};
