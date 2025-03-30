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
exports.createAuthModel = void 0;
// src/models/auth.ts
const mongoose_1 = __importStar(require("mongoose"));
// Enum for Access Status
const AccessStatusEnum = ['active', 'suspended'];
// Auth Schema Definition
const authSchema = new mongoose_1.Schema({
    cluster_id: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'col_cluster', required: true },
    cluster_num: { type: String, required: true },
    access_key: { type: String, required: true, maxlength: 20 },
    access_name: { type: String, required: true },
    access_num: { type: String, required: true },
    access_scope: { type: String, enum: ['super', 'app'], required: true },
    status: { type: String, enum: AccessStatusEnum, required: true, index: true },
    track: {
        added: { type: Date, default: Date.now },
        modified: { type: Date },
        activated: { type: Date },
        suspended: { type: Date, default: null } // Date when access was suspended (nullable)
    }
}, { versionKey: false });
const createAuthModel = (connection) => {
    return connection.model("Auth", authSchema, 'col_infra_access');
};
exports.createAuthModel = createAuthModel;
