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
exports.createDBVMModel = void 0;
// src/models/dbVM.ts
const mongoose_1 = __importStar(require("mongoose"));
// Database VM Schema Definition
const dbVMSchema = new mongoose_1.Schema({
    cluster_id: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Cluster', index: true, required: true },
    type: { type: String, index: true, required: true },
    collection_name: { type: String, required: false },
    host: { type: String, index: true, required: true },
    domain: { type: String, index: true, required: true },
    port: { type: String, index: true, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    zone: { type: String, required: true },
    specs: { type: mongoose_1.Schema.Types.Mixed, default: {} },
    status: { type: String, enum: ['open', 'assigned'], required: true, index: true },
    account: {
        account_id: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Account' },
        account_num: { type: String, index: true },
        account_name: { type: String } // Assigned account name
    },
    chatbots: [{ type: String }],
    track: {
        created: { type: Date, required: true },
        assigned: { type: Date } // When the VM was assigned to an account
    }
}, { versionKey: false });
// Create indexes
dbVMSchema.index({ host: 1, status: 1, 'account.account_num': 1 });
// DBVM model
// const DBVM = mongoose.model<IDBVM>("DBVM", dbVMSchema, 'col_vms_db');
// export default DBVM;
const createDBVMModel = (connection) => {
    return connection.model("DBVM", dbVMSchema, 'col_vms_db');
};
exports.createDBVMModel = createDBVMModel;
