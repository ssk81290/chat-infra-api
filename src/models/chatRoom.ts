// src/models/chatRoom.ts
import mongoose, { Schema, Document } from 'mongoose';

// Enum for Chat Room Status
const ChatRoomStatusEnum = ['active', 'idle', 'expired'] as const;

// Interface for ChatRoom Document
interface IChatRoom extends Document {
  cluster_id: mongoose.Types.ObjectId;
  cluster_num: string;
  account_id: mongoose.Types.ObjectId;
  account_num: string;
  account_name: string;
  chatbot_id: mongoose.Types.ObjectId;
  chatbot_num: string;
  chatbot_name: string;
  chatroom_name: string;
  status: typeof ChatRoomStatusEnum[number];
  intent: Record<string, any>;
  host: string;
  domain: string;
  capacity: {
    users: number;
    bots: number;
    agents: number;
    viewers: number;
  };
  in_session: {
    users: number;
    bots: number;
    agents: number;
    viewers: number;
  };
  track: {
    created: Date;
    started: Date;
    expired: Date;
  };
}

// ChatRoom Schema Definition
const chatRoomSchema: Schema = new Schema({
  cluster_id: { type: mongoose.Schema.Types.ObjectId, ref: 'col_cluster', required: true },
  cluster_num: { type: String, required: true },
  
  account_id: { type: mongoose.Schema.Types.ObjectId, ref: 'col_accounts', required: true },
  account_num: { type: String, required: true, index: true },
  account_name: { type: String, required: true, index: true },
  
  chatbot_id: { type: mongoose.Schema.Types.ObjectId, ref: 'col_chatbots', required: true },
  chatbot_num: { type: String, required: true, index: true },
  chatbot_name: { type: String, required: true, index: true },
  
  chatroom_name: { type: String, required: true },
  status: { type: String, enum: ChatRoomStatusEnum, required: true, index: true },
  
  intent: { type: Schema.Types.Mixed, default: {} },  // Flexible intent object
  
  host: { type: String, required: true, index: true },
  domain: { type: String, required: true },
  
  capacity: {
    users: { type: Number, default: 50 },
    bots: { type: Number, default: 1 },
    agents: { type: Number, default: 2 },
    viewers: { type: Number, default: 50 }
  },
  
  in_session: {
    users: { type: Number, default: 0 },
    bots: { type: Number, default: 0 },
    agents: { type: Number, default: 0 },
    viewers: { type: Number, default: 0 }
  },
  
  track: {
    created: { type: Date, default: Date.now },
    started: { type: Date },
    expired: { type: Date, index: true }
  }
});

// Create indexes on important fields
chatRoomSchema.index({ account_num: 1, chatbot_num: 1, host: 1, 'track.started': 1, 'track.expired': 1 });

// ChatRoom model
const ChatRoom = mongoose.model<IChatRoom>('col_chatrooms', chatRoomSchema);

export default ChatRoom;
