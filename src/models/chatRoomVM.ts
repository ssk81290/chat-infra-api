// src/models/chatRoomVM.ts
import mongoose, { Schema, Document } from 'mongoose';

// Interface for ChatRoom VM Document
interface IChatRoomVM extends Document {
  cluster_id: mongoose.Types.ObjectId;
  host: string;
  domain: string;
  zone: string;
  specs: Record<string, any>;
  count_chatrooms: number;
  track: {
    added: Date;
  };
}

// ChatRoom VM Schema Definition
const chatRoomVMSchema: Schema = new Schema({
  cluster_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Cluster', index: true, required: true }, // Cluster reference

  host: { type: String, index: true, required: true }, // Hostname
  domain: { type: String, index: true, required: true }, // Domain

  zone: { type: String, required: true }, // Cloud Zone for preference

  specs: { type: Schema.Types.Mixed, default: {} }, // VM specifications (e.g., CPU, RAM, etc.)

  count_chatrooms: { type: Number, required: true }, // Total live chat rooms on this VM

  track: {
    added: { type: Date, required: true } // When the VM was added
  }
});

// Create indexes for host and domain
chatRoomVMSchema.index({ host: 1, domain: 1 });

// ChatRoom VM model
const ChatRoomVM = mongoose.model<IChatRoomVM>('col_vms_chatroom', chatRoomVMSchema);

export default ChatRoomVM;
