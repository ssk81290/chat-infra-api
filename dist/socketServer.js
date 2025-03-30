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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageEmit = void 0;
// src/socketServer.ts
const socket_io_1 = require("socket.io");
const uuid_1 = require("uuid");
const rabbitMQ_1 = require("./utils/rabbitMQ");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const chatRoomToken_1 = require("./models/chatRoomToken"); // Token model
const chatRoom_1 = require("./models/chatRoom"); // Chat Room model
const infraDBConnection_1 = __importDefault(require("./utils/infraDBConnection"));
const chatbot_1 = require("./models/chatbot"); // Chat Room model
const chatRoomConnection_1 = __importDefault(require("./utils/chatRoomConnection"));
const chatController_1 = require("./controllers/chatController");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const Token = (0, chatRoomToken_1.createTokenModel)(chatRoomConnection_1.default);
const ChatBot = (0, chatbot_1.createChatbotModel)(infraDBConnection_1.default);
const ChatRoom = (0, chatRoom_1.createChatRoomModel)(infraDBConnection_1.default);
const io = new socket_io_1.Server(parseInt(process.env.SOCKET_PORT), {
    cors: {
        origin: "*", // Allow CORS for all origins
    },
});
const MESSAGE_QUEUE = "chatroom_messages"; // RabbitMQ queue name
// Maintain chat history and connected users
const chatHistory = {};
const connectedUsers = {}; // Map of chatroom_id -> (socket.id -> user_ref)
// Handle WebSocket connection events
io.on("connection", (socket) => {
    socket.on("user_joining", (token) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Decode and validate token
            const decodedToken = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            const chatroom_id = decodedToken.chatroom_id;
            const user_ref = decodedToken.user.user_ref;
            const user_role = decodedToken.user.role || 'viewer';
            yield Token.findOneAndDelete({ token_id: decodedToken.token_id });
            // Fetch the chatroom from the DB
            const chatRoom = yield ChatRoom.findById(chatroom_id);
            if (!chatRoom) {
                socket.emit("error", "Chatroom not found");
                return;
            }
            const chatbot = yield ChatBot.findById(chatRoom.chatbot_id);
            // Check if the chatroom has capacity for new users
            if (chatRoom.in_session.users >= chatRoom.capacity.users) {
                socket.emit("error", "Chatroom is full");
                return;
            }
            // Initialize the map for connected users if it doesn't exist
            if (!connectedUsers[chatroom_id]) {
                connectedUsers[chatroom_id] = new Map();
            }
            // Store the socket.id -> user_ref mapping
            connectedUsers[chatroom_id].set(socket.id, user_ref);
            // Update the connected user count in the chatroom
            // chatRoom.in_session.users += 1;
            chatRoom.in_session.users = Number(chatRoom.in_session.users) + 1;
            yield chatRoom.save();
            // Send the chat history and connected users list to the user
            socket.emit("show_latestChat", chatHistory[chatroom_id] || []);
            socket.emit("show_topics", (chatbot === null || chatbot === void 0 ? void 0 : chatbot.topics) || []);
            socket.emit("show_connected_users", Array.from(connectedUsers[chatroom_id].values()) || []);
            // Notify the chatroom that a new user has joined
            socket.to(chatroom_id).emit("user_joined", { user_ref });
            socket.join(chatroom_id);
        }
        catch (err) {
            socket.emit("error", "Invalid or expired token");
        }
    }));
    socket.on("message", (args) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Decode the token to get user details
            const decodedToken = jsonwebtoken_1.default.verify(args.token, process.env.JWT_SECRET);
            const chatroom_id = decodedToken.chatroom_id;
            const sender_id = decodedToken.user.user_ref;
            const sender_name = decodedToken.user.name;
            // Create a new message object with additional fields
            let newMessage = {
                msg_id: (0, uuid_1.v4)(),
                sender: {
                    user_id: sender_id,
                    auth_id: decodedToken.user.auth_id,
                    name: sender_name // Sender's name
                },
                msg: args.msg,
                timestamp: new Date(),
                account_id: decodedToken.account_num,
                chatbot_id: decodedToken.chatbot_num,
                chatroom_id: chatroom_id, // Chatroom ID
            };
            // Add the message to the chat history (last 20 messages)
            if (!chatHistory[chatroom_id]) {
                chatHistory[chatroom_id] = [];
            }
            chatHistory[chatroom_id].push(newMessage);
            if (chatHistory[chatroom_id].length > parseInt(process.env.CHAT_HISTORY)) {
                chatHistory[chatroom_id].shift(); // Keep only the last 20 messages
            }
            // Broadcast the message to other users in the same chatroom
            socket.to(chatroom_id).emit("message", newMessage);
            yield (0, chatController_1.saveChatMessage)(newMessage);
        }
        catch (err) {
            socket.emit("error", "Message sending failed");
        }
    }));
    // Handle user disconnecting
    socket.on("disconnect", () => __awaiter(void 0, void 0, void 0, function* () {
        const chatroom_id = Object.keys(connectedUsers).find(room => connectedUsers[room].has(socket.id));
        if (chatroom_id) {
            // Remove the user from connectedUsers using socket.id
            connectedUsers[chatroom_id].delete(socket.id);
            // Update the user count in the chatroom
            const chatRoom = yield ChatRoom.findById(chatroom_id);
            if (chatRoom) {
                chatRoom.in_session.users -= 1;
                yield chatRoom.save();
            }
            // Notify the chatroom that a user has left
            socket.to(chatroom_id).emit("user_left", socket.id);
        }
        console.log("A user disconnected");
    }));
});
console.log("Socket.io server is running on port", process.env.SOCKET_PORT);
const messageEmit = (chatroom_id, message) => {
    io.to(chatroom_id).emit("message", message);
};
exports.messageEmit = messageEmit;
const processMessage = (msg) => __awaiter(void 0, void 0, void 0, function* () {
    if (msg) {
        console.log(msg.content);
        const messageContent = JSON.parse(msg.content.toString());
        // Save message to the database
        yield (0, chatController_1.saveChatMessage)(messageContent);
        // Broadcast the message to the chatroom
        (0, exports.messageEmit)(messageContent.chatroom_id, messageContent);
        console.log("Message processed and broadcasted:", messageContent);
    }
});
// Start consuming messages from RabbitMQ
(0, rabbitMQ_1.consumeFromQueue)(MESSAGE_QUEUE, processMessage);
