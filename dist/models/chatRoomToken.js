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
exports.createTokenModel = void 0;
// src/models/chatRoomToken.ts
const mongoose_1 = __importStar(require("mongoose"));
// Token Schema Definition
const tokenSchema = new mongoose_1.Schema({
    chatbot_id: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Chatbot', required: true },
    chatroom_id: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'ChatRoom', required: true },
    user_ref: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, required: true },
    photo: { type: String, required: false },
    issued: { type: Date, default: Date.now },
    expiry: { type: Date, required: true }, // Expiry time of the token
}, { versionKey: false });
// // Token model
// const Token = mongoose.model<IToken>("Token", tokenSchema,'col_chatroom_tokens');
// export default Token;
const createTokenModel = (connection) => {
    return connection.model("Token", tokenSchema, 'col_chatroom_tokens');
};
exports.createTokenModel = createTokenModel;
