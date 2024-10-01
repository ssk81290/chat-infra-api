// src/models/userLog.ts
import mongoose, { Schema, Document } from 'mongoose';

// Interface for UserLog Document
interface IUserLog extends Document {
  chatbot_id: mongoose.Types.ObjectId;
  chatroom_id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  user_ref: string;
  name: string;
  role: string;
  ip: string;
  user_agent: string;
  track: {
    connected: Date;
    disconnected?: Date;
  };
}

// UserLog Schema Definition
const userLogSchema: Schema = new Schema({
  chatbot_id: { type: mongoose.Schema.Types.ObjectId, ref: 'col_chatbots', required: true },
  chatroom_id: { type: mongoose.Schema.Types.ObjectId, ref: 'col_chatrooms', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'col_chatroom_users', required: true }, // Reference to chat room user
  user_ref: { type: String, required: true },                                     // Authentication reference
  name: { type: String, required: true },                                         // User's name
  role: { type: String, required: true },                                         // User's role
  ip: { type: String, required: true },                                           // User's IP address
  user_agent: { type: String, required: true },                                   // User's agent
  track: {
    connected: { type: Date, required: true },                                    // Timestamp when user connected
    disconnected: { type: Date }                                                  // Timestamp when user disconnected
  }
});

// Create indexes for chatbot_id, chatroom_id, and user_id
userLogSchema.index({ chatbot_id: 1, chatroom_id: 1, user_id: 1 });

// UserLog model
const UserLog = mongoose.model<IUserLog>('col_chatroom_user_log', userLogSchema);

export default UserLog;
