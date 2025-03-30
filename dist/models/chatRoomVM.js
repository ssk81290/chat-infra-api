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
exports.createChatRoomVMModel = void 0;
// src/models/chatRoomVM.ts
const mongoose_1 = __importStar(require("mongoose"));
// ChatRoom VM Schema Definition
const chatRoomVMSchema = new mongoose_1.Schema({
    cluster_id: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Cluster', index: true, required: true },
    host: { type: String, index: true, required: true },
    domain: { type: String, index: true, required: true },
    zone: { type: String, required: true },
    specs: { type: mongoose_1.Schema.Types.Mixed, default: {} },
    count_chatrooms: { type: Number, required: true },
    track: {
        added: { type: Date, required: true } // When the VM was added
    }
}, { versionKey: false });
// Create indexes for host and domain
chatRoomVMSchema.index({ host: 1, domain: 1 });
// ChatRoom VM model
// const ChatRoomVM = mongoose.model<IChatRoomVM>("ChatRoomVM", chatRoomVMSchema , 'col_vms_chatroom');
// export default ChatRoomVM;
const createChatRoomVMModel = (connection) => {
    return connection.model("ChatRoomVM", chatRoomVMSchema, 'col_vms_chatroom');
};
exports.createChatRoomVMModel = createChatRoomVMModel;
