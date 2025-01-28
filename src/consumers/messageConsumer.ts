// src/consumers/messageConsumer.ts
import {  consumeFromQueue } from "../utils/rabbitMQ";
import { saveChatMessage } from "../controllers/chatController";

// RabbitMQ message consumer to process and broadcast messages
const MESSAGE_QUEUE = "chatroom_messages";

const processMessage = async (msg: any) => {
  if (msg) {
    console.log(msg.content);
    const messageContent = JSON.parse(msg.content.toString());

    // Save message to the database
   await saveChatMessage(messageContent);
    // await savedMessage.save();

    // Broadcast the message to the respective chatroom
    // io.to(messageContent.chatroom_id).emit("message", messageContent);
    // io.to("chatroom_id").emit("message", "message");
    // messageEmit(messageContent.chatroom_id, messageContent)
    console.log("Message processed and broadcasted:", messageContent);
  }
};

// Start consuming messages from RabbitMQ
consumeFromQueue(MESSAGE_QUEUE, processMessage);

console.log("Message consumer is running and listening to RabbitMQ queue.");
