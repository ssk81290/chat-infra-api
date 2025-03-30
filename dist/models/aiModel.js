"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAIModel = void 0;
const mongoose_1 = require("mongoose");
const aiModelSchema = new mongoose_1.Schema({
    model: { type: String, required: true, unique: true, index: true },
    variants: { type: [String], default: [] },
    type: { type: String, required: true, enum: ['llm', 'embed'], index: true },
    description: { type: String, required: true },
    status: { type: String, required: true, enum: ['suspended', 'active'], index: true },
    platforms: { type: [String], default: [] },
    platform: { type: String, required: true },
    default: { type: Boolean, required: true, index: true },
}, { versionKey: false });
const createAIModel = (connection) => {
    return connection.model('AIModel', aiModelSchema, 'col_ai_models');
};
exports.createAIModel = createAIModel;
