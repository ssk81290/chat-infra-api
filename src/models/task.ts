import { Schema, Document, Model, Connection } from 'mongoose';

interface ITaskParent {
  task_group_id: string; // Parent Task ID (Object ID from col_enterprise_data_sources)
  task_group_type: string; // Enum: 'website', 'sitemap'
}

interface ITaskFile {
  loader: string; // File Loader Enum
  name: string; // File Name
  size: number; // File Size (bytes)
  file: string; // Local File Path
  chunk_size?: number; // Optional Chunk Size
  chunk_overlap?: number; // Optional Chunk Overlap
}

interface ITaskURL {
  loader: string; // URL Loader Enum
  url: string; // Public URL
  size: number; // File Size (bytes)
  chunk_size?: number; // Optional Chunk Size
  chunk_overlap?: number; // Optional Chunk Overlap
}

interface ITaskDB {
  loader: string; // DB Loader Enum
  host: string; // Host Name/IP
  port: number; // Port Number
  namespace: string;
  username: string;
  password: string;
  collection: string;
  data: {
    collection: string;
    fields: string[];
    filter: any[];
  };
  chunk_size?: number;
  chunk_overlap?: number;
}

interface ITaskTrack {
  added: Date;
  queued: Date;
  processing?: Date;
  done?: Date;
  failed?: Date;
}

interface IEnterpriseDataTask extends Document {
  parent: ITaskParent;
  account_id: string;
  account_num: string;
  chatbot_id: string;
  chatbot_num: string;
  type: string; // Task Type Enum
  file?: ITaskFile;
  url?: ITaskURL;
  database?: ITaskDB;
  status: string; // Task Status Enum
  count: {
    embedding: number;
  };
  track: ITaskTrack;
}

const taskSchema: Schema = new Schema({
  parent: {
    task_group_id: { type: Schema.Types.ObjectId, ref: 'EnterpriseDataSources', required:false },
    task_group_type: { type: String, enum: ['website', 'sitemap'],required:false },
  },
  account_id: { type: String, required: true, index: true },
  account_num: { type: String, required: true, index: true },
  chatbot_id: { type: String, required: true, index: true },
  chatbot_num: { type: String, required: true, index: true },
  type: { type: String, enum: ['file', 'url', 'db'], required: true, index: true },
  file: {
    loader: { type: String },
    name: { type: String },
    size: { type: Number },
    file: { type: String },
    chunk_size: { type: Number },
    chunk_overlap: { type: Number },
  },
  url: {
    loader: { type: String },
    url: { type: String },
    size: { type: Number },
    chunk_size: { type: Number },
    chunk_overlap: { type: Number },
  },
  database: {
    loader: { type: String },
    host: { type: String },
    port: { type: Number },
    namespace: { type: String },
    username: { type: String },
    password: { type: String },
    collection: { type: String },
    data: {
      collection: { type: String },
      fields: [{ type: String }],
      filter: [{ type: Schema.Types.Mixed }],
    },
    chunk_size: { type: Number },
    chunk_overlap: { type: Number },
  },
  status: { type: String, enum: ['queued', 'processing', 'done', 'failed'], required: true },
  count: {
    embedding: { type: Number, default: 0 },
  },
  track: {
    added: { type: Date, default: Date.now },
    queued: { type: Date, default: Date.now },
    processing: { type: Date },
    done: { type: Date },
    failed: { type: Date },
  },
}, { versionKey: false, timestamps: false });



export const createTaskModel = (connection: Connection) => {
    return connection.model<IEnterpriseDataTask>("EnterpriseDataTask", taskSchema,'col_enterprise_data_tasks');
  
  };