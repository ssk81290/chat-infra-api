"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createChatScriptModel = void 0;
// src/models/chatScript.ts
const mongoose_1 = require("mongoose");
// ChatScript Schema Definition
const chatScriptSchema = new mongoose_1.Schema({
    account_id: { type: String, required: false },
    chatbot_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Chatbot', required: false, index: true },
    chatroom_id: { type: String, required: false, index: true },
    sender: {
        role: { type: String, required: false },
        user_ref: { type: String, required: false },
        name: { type: String, required: false },
        photo: { type: String } // Optional profile picture URL
    },
    msg: { type: mongoose_1.Schema.Types.Mixed, required: false },
    posted: { type: Date, default: Date.now, required: false } // Date when the message was posted
}, { versionKey: false });
// Indexing for faster querying
chatScriptSchema.index({ account_id: 1, chatbot_id: 1, chatroom_id: 1, 'sender.user_ref': 1 });
// Function to create the model with a specified connection
const createChatScriptModel = (connection) => {
    return connection.model('ChatScript', chatScriptSchema, 'col_chatscripts');
};
exports.createChatScriptModel = createChatScriptModel;
