"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTaskModel = void 0;
const mongoose_1 = require("mongoose");
const taskSchema = new mongoose_1.Schema({
    parent: {
        task_group_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'EnterpriseDataSources', required: false },
        task_group_type: { type: String, enum: ['website', 'sitemap'], required: false },
    },
    account_id: { type: String, required: true, index: true },
    account_num: { type: String, required: true, index: true },
    chatbot_id: { type: String, required: true, index: true },
    chatbot_num: { type: String, required: true, index: true },
    type: { type: String, enum: ['file', 'url', 'db'], required: true, index: true },
    file: {
        loader: { type: String },
        name: { type: String },
        size: { type: Number },
        file: { type: String },
        chunk_size: { type: Number },
        chunk_overlap: { type: Number },
    },
    url: {
        loader: { type: String },
        url: { type: String },
        size: { type: Number },
        chunk_size: { type: Number },
        chunk_overlap: { type: Number },
    },
    database: {
        loader: { type: String },
        host: { type: String },
        port: { type: Number },
        namespace: { type: String },
        username: { type: String },
        password: { type: String },
        collection: { type: String },
        data: {
            collection: { type: String },
            fields: [{ type: String }],
            filter: [{ type: mongoose_1.Schema.Types.Mixed }],
        },
        chunk_size: { type: Number },
        chunk_overlap: { type: Number },
    },
    status: { type: String, enum: ['queued', 'processing', 'done', 'failed'], required: true },
    count: {
        embedding: { type: Number, default: 0 },
    },
    track: {
        added: { type: Date, default: Date.now },
        queued: { type: Date, default: Date.now },
        processing: { type: Date },
        done: { type: Date },
        failed: { type: Date },
    },
}, { versionKey: false, timestamps: false });
const createTaskModel = (connection) => {
    return connection.model("EnterpriseDataTask", taskSchema, 'col_enterprise_data_tasks');
};
exports.createTaskModel = createTaskModel;
