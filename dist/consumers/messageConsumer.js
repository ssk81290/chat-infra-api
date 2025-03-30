"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/consumers/messageConsumer.ts
const rabbitMQ_1 = require("../utils/rabbitMQ");
const chatController_1 = require("../controllers/chatController");
// RabbitMQ message consumer to process and broadcast messages
const MESSAGE_QUEUE = "chatroom_messages";
const processMessage = (msg) => __awaiter(void 0, void 0, void 0, function* () {
    if (msg) {
        console.log(msg.content);
        const messageContent = JSON.parse(msg.content.toString());
        // Save message to the database
        yield (0, chatController_1.saveChatMessage)(messageContent);
        // await savedMessage.save();
        // Broadcast the message to the respective chatroom
        // io.to(messageContent.chatroom_id).emit("message", messageContent);
        // io.to("chatroom_id").emit("message", "message");
        // messageEmit(messageContent.chatroom_id, messageContent)
        console.log("Message processed and broadcasted:", messageContent);
    }
});
// Start consuming messages from RabbitMQ
(0, rabbitMQ_1.consumeFromQueue)(MESSAGE_QUEUE, processMessage);
console.log("Message consumer is running and listening to RabbitMQ queue.");
