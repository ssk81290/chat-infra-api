// src/controllers/chatController.ts
import chatbotDBConnection from '../utils/chatRoomConnection';
import { createChatScriptModel } from '../models/chatScript';

// Create ChatScript model using the specific connection
const ChatScript = createChatScriptModel(chatbotDBConnection);

// Example function to save a chat message
export const saveChatMessage = async (data: any) => {
  const newChatScript = new ChatScript(data);

  await newChatScript.save();
  console.log('ChatScript saved:', newChatScript);
};


