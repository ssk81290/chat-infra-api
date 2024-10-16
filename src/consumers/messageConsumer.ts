// src/consumers/messageConsumer.ts
import { consumeFromQueue } from "../utils/rabbitMQ";
// import Message from "../models/message"; // Message model
import { Server } from "socket.io";
import { saveChatMessage } from "../controllers/chatController";

const io = new Server(3000, {
  cors: {
    origin: "*", // Allow CORS for all origins
  },
});

// RabbitMQ message consumer to process and broadcast messages
const MESSAGE_QUEUE = "chatroom_messages";

const processMessage = async (msg: any) => {
  if (msg) {
    const messageContent = JSON.parse(msg.content.toString());

    // Save message to the database
   await saveChatMessage(messageContent);
    // await savedMessage.save();

    // Broadcast the message to the respective chatroom
    io.to(messageContent.chatroom_id).emit("message", messageContent);
    console.log("Message processed and broadcasted:", messageContent);
  }
};

// Start consuming messages from RabbitMQ
consumeFromQueue(MESSAGE_QUEUE, processMessage);

console.log("Message consumer is running and listening to RabbitMQ queue.");
