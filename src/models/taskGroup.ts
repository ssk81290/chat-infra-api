// src/models/user.ts
import mongoose, { Schema, Document, Connection } from 'mongoose';

// Interface for User Document
interface ITaskGroup extends Document {
  account_id: mongoose.Types.ObjectId;
  account_num: string;
  chatbot_id: mongoose.Types.ObjectId;
  chatbot_num: string;
  job_title: string;
  url: string;
  pre_process:{
    include_head: boolean;
	retain_href: boolean;
	remove_orphans: boolean;

  };
  status: string;		// Enum: Refer Job Type Status List
  count: {
      url_read : number;
      done: number;
      failed: number;
  };
  track: {
      added: Date;
      url_read: Date;
      queued: Date;
      processing: Date;
      done: Date;
      failed: Date;
      failed_reason: string;
  }; 
 
}

// User Schema Definition
const userSchema: Schema = new Schema({
  account_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
  account_num: { type: String, required: true, index: true },
  chatbot_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Chatbot', required: true },
  chatbot_num: { type: String, required: true, index: true },  
  status: { type: String, required: true, index: true },  // Chat Room User Status
  job_title: { type: String, required: true },              // User authentication reference
  url: { type: String, required: true },             // User's name
 
  pre_process: {  
    include_head: { type: Boolean },
	retain_href: { type: Boolean },
	remove_orphans: { type: Boolean },                                      // Qualified lead data
   
  },

  
  count: {                                              // Referral tracking information
    url_read: { type: Number },
    done: { type: Number },
    failed: { type: Number },    
  },
 
  
  track: {                                                 // User connection tracking
    added: { type: Date, required: true },
    queued: { type: Date, required: false },
    processing: { type: Date, required: false },
    url_read: { type: Date, required: false },
    done: { type: Date, required: false },
    failed : { type: Date, required: false },
    failed_reason: { type: String, required: false }, 
  }
},{ versionKey: false });

// Create indexes on important fields
userSchema.index({ account_num: 1, chatbot_num: 1, status: 1 });

export const createTaskGroupModel = (connection: Connection) => {
  return connection.model<ITaskGroup>("ITaskGroup", userSchema, 'col_enterprise_data_taskgroups');
};
