// src/models/chatScript.ts
import { Connection, Schema, Document } from 'mongoose';

// Interface for ChatScript Document
interface IChatScript extends Document {
  account_id: string;
  chatbot_id: string;
  chatroom_id: string;
  sender: {
    role: string;
    user_ref: string;
    name: string;
    photo?: string;
  };
  msg: Record<string, any>;
  posted: Date;
}

// ChatScript Schema Definition
const chatScriptSchema: Schema = new Schema({
  account_id: { type: Schema.Types.ObjectId, ref: 'Account', required: true, index: true }, // Reference to Account
  chatbot_id: { type: Schema.Types.ObjectId, ref: 'Chatbot', required: true, index: true }, // Reference to Chatbot
  chatroom_id: { type: String, required: true, index: true }, // Reference to Chatroom

  sender: {
    role: { type: String, required: true }, // Sender's role (viewer, sender, bot, agent)
    user_ref: { type: String, required: true }, // Sender's user authentication reference
    name: { type: String, required: true }, // Sender's name
    photo: { type: String } // Optional profile picture URL
  },

  msg: { type: Schema.Types.Mixed, required: true }, // Message content object (varied structure)
  
  posted: { type: Date, default: Date.now, required: true } // Date when the message was posted
});

// Indexing for faster querying
chatScriptSchema.index({ account_id: 1, chatbot_id: 1, chatroom_id: 1, 'sender.user_ref': 1 });

// Function to create the model with a specified connection
export const createChatScriptModel = (connection: Connection) => {
  return connection.model<IChatScript>('ChatScript', chatScriptSchema);
};
