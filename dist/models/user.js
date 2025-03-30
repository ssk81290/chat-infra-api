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
exports.createUserModel = void 0;
// src/models/user.ts
const mongoose_1 = __importStar(require("mongoose"));
// User Schema Definition
const userSchema = new mongoose_1.Schema({
    account_id: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Account', required: true },
    account_num: { type: String, required: true, index: true },
    chatbot_id: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Chatbot', required: true },
    chatbot_num: { type: String, required: true, index: true },
    chatroom_id: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'ChatRoom', required: true },
    session_id: { type: String, required: false },
    status: { type: String, required: true, index: true },
    user_ref: { type: String, required: true },
    name: { type: String, required: true },
    ip: { type: String, required: false },
    user_agent: { type: String, required: false },
    photo: { type: String },
    role: { type: String, enum: ['viewer', 'user', 'bot', 'agent'], required: true },
    qualified: {
        phone: { type: String },
        email: { type: String },
        tag: { type: String }
    },
    intent: { type: mongoose_1.Schema.Types.Mixed, default: {} },
    referral: {
        gclid: { type: String },
        fbclid: { type: String },
        utm_campaign: { type: String },
        utm_source: { type: String },
        utm_medium: { type: String }
    },
    delivery: [{
            extn: { type: String },
            action: { type: String },
            status: { type: String },
            track: {
                queued: { type: Date, required: true },
                sent: { type: Date },
                failed: { type: Date },
                reason: { type: String }
            }
        }],
    track: {
        assigned: { type: Date, required: true },
        connected: { type: Date },
        disconnected: { type: Date }
    }
}, { versionKey: false });
// Create indexes on important fields
userSchema.index({ account_num: 1, chatbot_num: 1, chatroom_id: 1, status: 1 });
const createUserModel = (connection) => {
    return connection.model("User", userSchema, 'col_chatroom_users');
};
exports.createUserModel = createUserModel;
