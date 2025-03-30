"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createChatroomSessionModel = void 0;
const mongoose_1 = require("mongoose");
// Define the Mongoose schema
const ChatroomSessionSchema = new mongoose_1.Schema({
    account_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Account', required: true },
    account_num: { type: String, required: true, index: true },
    chatbot_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Chatbot', required: true },
    chatbot_num: { type: String, required: true, index: true },
    chatroom_id: { type: String, required: true, index: true },
    session_id: { type: String, required: true, index: true, unique: true },
    session_start: { type: Date, required: true, default: Date.now },
    session_stop: { type: Date },
    count: {
        user: { type: Number, default: 0 },
        viewer: { type: Number, default: 0 },
        bot: { type: Number, default: 0 },
        agent: { type: Number, default: 0 },
    },
}, {
    timestamps: true,
    collection: 'col_chatroom_sessions',
});
// Create and export the model
const createChatroomSessionModel = (connection) => {
    return connection.model('ChatroomSession', ChatroomSessionSchema, 'col_chatroom_sessions');
};
exports.createChatroomSessionModel = createChatroomSessionModel;
