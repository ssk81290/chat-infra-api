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
exports.createChatbotModel = void 0;
// src/models/chatbot.ts
const mongoose_1 = __importStar(require("mongoose"));
// Chatbot schema
const chatbotSchema = new mongoose_1.default.Schema({
    cluster_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Cluster",
        required: false,
    },
    cluster_num: { type: String, required: false },
    cluster_name: { type: String, required: false },
    flag: { type: String, required: false },
    access_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Auth",
        required: false,
    },
    access_num: { type: String, required: false },
    account_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Account",
        required: false,
    },
    account_num: { type: String, required: false, index: false },
    account_name: { type: String, required: false },
    chatbot_num: { type: String, required: false, unique: false, index: false },
    chatbot_name: { type: String, required: false },
    status: { type: String, required: false, index: false, default: "active" },
    mode: { type: String, required: false, index: false },
    preferences: {
        users: { type: Number, required: false },
        bots: { type: Number, required: false },
        agents: { type: Number, required: false },
        viewers: { type: String, required: false },
        bot: {
            name: { type: String, required: false },
            avatar: { type: String, required: false },
            processor: { type: String, required: false },
            script: { type: String, required: false },
            path: { type: String, required: false },
        },
        theme: { type: String, default: "light" },
        img_trigger: { type: String, required: false },
        lifespan: { type: Number, default: 72 },
        embeddings: { type: Object, default: {} },
        query: { type: Object, default: {} },
        welcome: { type: String, required: false },
    },
    topics: { type: [String], default: [] },
    auto_topics: {
        generate: { type: Boolean, default: false },
        interval: { type: Number, default: false },
    },
    chat_db: {
        host: { type: String, required: false },
        port: { type: Number, required: false },
        namespace: { type: String, required: false },
        username: { type: String, required: false },
        password: { type: String, required: false },
    },
    vector_db: { type: Object, required: false },
    prompt: {
        persona: { type: String, required: false },
        persona_obj: { type: Object, required: false },
        instructions: { type: Object, required: false },
        collect: { type: Object, required: false },
        extra: { type: Object, required: false },
    },
    webhook: {
        url: { type: String, required: false },
        auth: { type: String, required: false },
        username: { type: String, required: false },
        password: { type: String, required: false },
        events: { type: Map, of: Boolean, required: false },
    },
    connectors: {
        type: Map,
        of: new mongoose_1.default.Schema({
            name: { type: String, required: false },
            actions: {
                type: Map,
                of: new mongoose_1.default.Schema({
                    label: { type: String, required: false },
                    payload: { type: Map, of: mongoose_1.Schema.Types.Mixed, required: false },
                }),
                required: false,
            },
            cred: {
                username: { type: String, required: false },
                password: { type: String, required: false },
            },
        }),
    },
    access: {
        web: {
            domains: { type: String, required: false },
            strict: { type: Boolean, required: false },
        },
        apps: { type: Boolean, required: false },
    },
    track: {
        added: { type: Date, default: Date.now },
        modified: { type: Date, default: Date.now },
        suspended: { type: Date },
        activated: { type: Date },
    },
}, { versionKey: false });
const createChatbotModel = (connection) => {
    return connection.model("Chatbot", chatbotSchema, "col_chatbots");
};
exports.createChatbotModel = createChatbotModel;
