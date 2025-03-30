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
exports.createTaskGroupModel = void 0;
// src/models/user.ts
const mongoose_1 = __importStar(require("mongoose"));
// User Schema Definition
const userSchema = new mongoose_1.Schema({
    account_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Account",
        required: true,
    },
    account_num: { type: String, required: true, index: true },
    chatbot_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Chatbot",
        required: true,
    },
    chatbot_num: { type: String, required: true, index: true },
    status: { type: String, required: true, index: true },
    job_title: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, required: false },
    pre_process: {
        include_head: { type: Boolean },
        retain_href: { type: Boolean },
        remove_orphans: { type: Boolean }, // Qualified lead data
    },
    count: {
        // Referral tracking information
        url_read: { type: Number },
        done: { type: Number },
        failed: { type: Number },
    },
    track: {
        // User connection tracking
        added: { type: Date, required: true },
        queued: { type: Date, required: false },
        processing: { type: Date, required: false },
        url_read: { type: Date, required: false },
        done: { type: Date, required: false },
        failed: { type: Date, required: false },
        failed_reason: { type: String, required: false },
    },
}, { versionKey: false });
// Create indexes on important fields
userSchema.index({ account_num: 1, chatbot_num: 1, status: 1 });
const createTaskGroupModel = (connection) => {
    return connection.model("ITaskGroup", userSchema, "col_enterprise_data_taskgroups");
};
exports.createTaskGroupModel = createTaskGroupModel;
