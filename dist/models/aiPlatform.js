"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAIPlatform = void 0;
const mongoose_1 = require("mongoose");
const aiPlatformSchema = new mongoose_1.Schema({
    platform: { type: String, required: true, unique: true, index: true },
    abbr: { type: String, required: true, unique: true, index: true },
    access_key: { type: String, required: true },
}, { versionKey: false });
const createAIPlatform = (connection) => {
    return connection.model('AIPlatform', aiPlatformSchema, 'col_ai_platforms');
};
exports.createAIPlatform = createAIPlatform;
