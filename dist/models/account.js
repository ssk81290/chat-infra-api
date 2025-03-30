"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAccountModel = void 0;
// src/models/account.ts
const mongoose_1 = __importDefault(require("mongoose"));
// Account schema
const accountSchema = new mongoose_1.default.Schema({
    cluster_id: { type: mongoose_1.default.Schema.Types.ObjectId, required: true, ref: 'Cluster' },
    cluster_num: { type: String, required: true, ref: 'Cluster' },
    access_id: { type: mongoose_1.default.Schema.Types.ObjectId, required: true, ref: 'Auth' },
    access_num: { type: String, required: true, ref: 'Auth' },
    customer_id: { type: String, required: true },
    account_num: { type: String, required: true, unique: true, index: true },
    account_name: { type: String, required: true, index: true },
    status: { type: String, required: true, index: true },
    chatbot: {
        unlimited: { type: Boolean, default: false },
        max_allowed: { type: Number, default: 0 },
        zones: { type: [String], default: [] }
    },
    track: {
        added: { type: Date, default: Date.now },
        modified: { type: Date, default: Date.now },
        activated: { type: Date },
        suspended: { type: Date }
    }
}, { versionKey: false });
const createAccountModel = (connection) => {
    return connection.model("Account", accountSchema, 'col_accounts');
};
exports.createAccountModel = createAccountModel;
