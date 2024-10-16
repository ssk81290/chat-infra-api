// src/models/dbVM.ts
import mongoose, { Schema, Document, Connection } from 'mongoose';

// Interface for Database VM Document
interface IDBVM extends Document {
  cluster_id: mongoose.Types.ObjectId;
  host: string;
  domain: string;
  port: string;
  username: string;
  password: string;
  zone: string;
  specs: Record<string, any>;
  status: 'open' | 'assigned';
  account: {
    account_id: mongoose.Types.ObjectId;
    account_num: string;
    account_name: string;
  };
  chatbots: string[];
  track: {
    created: Date;
    assigned?: Date;
  };
}

// Database VM Schema Definition
const dbVMSchema: Schema = new Schema({
  cluster_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Cluster', index: true, required: true }, // Cluster reference

  host: { type: String, index: true, required: true }, // Hostname
  domain: { type: String, index: true, required: true }, // Domain
  port: { type: String, index: true, required: true }, // Port number
  username: { type: String, required: true }, // Root username for database VM
  password: { type: String, required: true }, // Root password for database VM

  zone: { type: String, required: true }, // Cloud Zone for preference

  specs: { type: Schema.Types.Mixed, default: {} }, // VM specifications (capability information)

  status: { type: String, enum: ['open', 'assigned'], required: true, index: true }, // Assignment status (open/assigned)

  account: {
    account_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' }, // Assigned account reference
    account_num: { type: String, index: true }, // Assigned account number
    account_name: { type: String } // Assigned account name
  },

  chatbots: [{ type: String }], // Array of chatbot IDs using this database VM

  track: {
    created: { type: Date, required: true }, // When the VM was created
    assigned: { type: Date } // When the VM was assigned to an account
  }
});

// Create indexes
dbVMSchema.index({ host: 1, status: 1, 'account.account_num': 1 });

// DBVM model
// const DBVM = mongoose.model<IDBVM>("DBVM", dbVMSchema, 'col_vms_db');

// export default DBVM;

export const createDBVMModel = (connection: Connection) => {
  return connection.model<IDBVM>("DBVM", dbVMSchema, 'col_vms_db');

};


