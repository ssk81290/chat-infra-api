"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/utils/dbConnection.ts
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
dotenv_1.default.config();
// Create a new connection to a specific MongoDB database
const chatRoomDBConnection = mongoose_1.default.createConnection(process.env.CHATROOM_MONGO_URI);
chatRoomDBConnection.on('connected', () => {
    console.log('Connected to Chatbot Database');
});
exports.default = chatRoomDBConnection;
