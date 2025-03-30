"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createQueryProcessorModel = void 0;
const mongoose_1 = require("mongoose");
const queryProcessorSchema = new mongoose_1.Schema({
    processor: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    avatar: { type: String, required: true },
    command: { type: String, required: true },
    path: { type: String, required: true },
    script: { type: String, required: true },
    account_num: { type: String, index: true },
    chatbot_num: { type: String, index: true },
    default: { type: Boolean, required: true, index: true },
    mode: { type: String, required: true }
}, { versionKey: false });
const createQueryProcessorModel = (connection) => {
    return connection.model('QueryProcessor', queryProcessorSchema, 'col_query_processors');
};
exports.createQueryProcessorModel = createQueryProcessorModel;
