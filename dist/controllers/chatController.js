"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveChatMessage = void 0;
// src/controllers/chatController.ts
const chatRoomConnection_1 = __importDefault(require("../utils/chatRoomConnection"));
const chatScript_1 = require("../models/chatScript");
// Create ChatScript model using the specific connection
const ChatScript = (0, chatScript_1.createChatScriptModel)(chatRoomConnection_1.default);
// Example function to save a chat message
const saveChatMessage = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const newChatScript = new ChatScript(data);
    yield newChatScript.save();
    console.log('ChatScript saved:', newChatScript);
});
exports.saveChatMessage = saveChatMessage;
