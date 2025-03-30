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
exports.createChatRoomModel = void 0;
// src/models/chatRoom.ts
const mongoose_1 = __importStar(require("mongoose"));
// Enum for Chat Room Status
const ChatRoomStatusEnum = ['active', 'idle', 'expired'];
// ChatRoom Schema Definition
const chatRoomSchema = new mongoose_1.Schema({
    cluster_id: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'cluster', required: true },
    cluster_num: { type: String, required: true },
    account_id: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Account', required: true },
    account_num: { type: String, required: true, index: true },
    account_name: { type: String, required: true, index: true },
    chatbot_id: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Chatbot', required: true },
    chatbot_num: { type: String, required: true, index: true },
    chatbot_name: { type: String, required: true, index: true },
    chatroom_name: { type: String, required: true },
    status: { type: String, enum: ChatRoomStatusEnum, required: true, index: true },
    intent: { type: mongoose_1.Schema.Types.Mixed, default: {} },
    host: { type: String, required: false, index: true },
    domain: { type: String, required: true },
    capacity: {
        users: { type: Number, default: 50 },
        bots: { type: Number, default: 1 },
        agents: { type: Number, default: 2 },
        viewers: { type: Number, default: 50 }
    },
    in_session: {
        users: { type: Number, default: 0 },
        bots: { type: Number, default: 0 },
        agents: { type: Number, default: 0 },
        viewers: { type: Number, default: 0 }
    },
    track: {
        created: { type: Date, default: Date.now },
        started: { type: Date },
        expired: { type: Date, index: true }
    }
}, { versionKey: false });
// Create indexes on important fields
chatRoomSchema.index({ account_num: 1, chatbot_num: 1, host: 1, 'track.started': 1, 'track.expired': 1 });
// // ChatRoom model
// const ChatRoom = mongoose.
// export default ChatRoom;
const createChatRoomModel = (connection) => {
    return connection.model("ChatRoom", chatRoomSchema, 'col_chatrooms');
};
exports.createChatRoomModel = createChatRoomModel;
