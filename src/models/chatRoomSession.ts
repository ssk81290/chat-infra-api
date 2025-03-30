import mongoose, { Schema, Document, Connection } from 'mongoose';


// Define the interface for TypeScript
export interface IChatroomSession extends Document {
  account_id: mongoose.Types.ObjectId;
  account_num: string;
  chatbot_id: mongoose.Types.ObjectId;
  chatbot_num: string;
  chatroom_id: string;
  session_id: string;
  session_start: Date;
  session_stop?: Date;
  count: {
    user: number;
    viewer: number;
    bot: number;
    agent: number;
  };
}

// Define the Mongoose schema
const ChatroomSessionSchema: Schema = new Schema(
  {
    account_id: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
    account_num: { type: String, required: true, index: true },

    chatbot_id: { type: Schema.Types.ObjectId, ref: 'Chatbot', required: true },
    chatbot_num: { type: String, required: true, index: true },

    chatroom_id: { type: String, required: true, index: true },
    session_id: { type: String, required: true, index: true, unique: true },

    session_start: { type: Date, required: true, default: Date.now },
    session_stop: { type: Date },

    count: {
      user: { type: Number, default: 0 },
      viewer: { type: Number, default: 0 },
      bot: { type: Number, default: 0 },
      agent: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
    collection: 'col_chatroom_sessions',
  }
);

// Create and export the model
export const createChatroomSessionModel = (connection: Connection) => {
  return connection.model<IChatroomSession>('ChatroomSession', ChatroomSessionSchema, 'col_chatroom_sessions');
};
