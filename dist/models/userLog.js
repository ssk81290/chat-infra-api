"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserLogModel = void 0;
// src/models/userLog.ts
const mongoose_1 = __importStar(require("mongoose"));
// UserLog Schema Definition
const userLogSchema = new mongoose_1.Schema({
    chatbot_id: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Chatbot', required: true },
    chatroom_id: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'ChatRoom', required: true },
    user_id: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    session_id: { type: String, required: false },
    user_ref: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, required: false },
    ip: { type: String, required: false },
    user_agent: { type: String, required: true },
    track: {
        connected: { type: Date, required: true },
        disconnected: { type: Date } // Timestamp when user disconnected
    }
}, { versionKey: false });
// Create indexes for chatbot_id, chatroom_id, and user_id
userLogSchema.index({ chatbot_id: 1, chatroom_id: 1, user_id: 1 });
const createUserLogModel = (connection) => {
    return connection.model("UserLog", userLogSchema, 'col_chatroom_user_log');
};
exports.createUserLogModel = createUserLogModel;
