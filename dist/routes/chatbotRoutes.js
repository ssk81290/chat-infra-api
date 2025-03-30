"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/chatbotRoutes.ts
const express_1 = __importDefault(require("express"));
const chatbotController_1 = require("../controllers/chatbotController");
const auth_1 = __importDefault(require("../middleware/auth")); // Assuming you have basic auth middleware
const chatRoomController_1 = require("../controllers/chatRoomController");
const router = express_1.default.Router();
// chatbot routes
router.post('/v1/chatbots', auth_1.default, chatbotController_1.createChatbot);
router.get('/v1/chatbots/:chatbot_num', auth_1.default, chatbotController_1.getChatbot);
router.post('/v1/chatbots/search', auth_1.default, chatbotController_1.searchChatbots);
router.patch('/v1/chatbots/:chatbot_num', auth_1.default, chatbotController_1.updateChatbotProfile);
router.patch('/v1/chatbots/:chatbot_num/status', auth_1.default, chatbotController_1.updateChatbotStatus);
router.patch('/v1/chatbots/:chatbot_num/topics', auth_1.default, chatbotController_1.updateChatbotTopics);
router.patch('/v1/chatbots/:chatbot_num/chat-db', auth_1.default, chatbotController_1.updateChatbotChatDB);
router.patch('/v1/chatbots/:chatbot_num/vector-db', auth_1.default, chatbotController_1.updateChatbotVectorDB);
router.patch('/v1/chatbots/:chatbot_num/webhook', auth_1.default, chatbotController_1.updateChatbotWebhook);
router.patch('/v1/chatbots/:chatbot_num/ai-models', auth_1.default, chatbotController_1.updateChatbotAIModels);
router.patch('/v1/chatbots/:chatbot_num/prompt', auth_1.default, chatbotController_1.updateChatbotPrompt);
// chatroom routes
router.post('/v1/chatbots/:chatbot_num/chatrooms', auth_1.default, chatRoomController_1.createChatRoom);
router.get('/v1/chatbots/:chatbot_num/chatrooms', auth_1.default, chatRoomController_1.getChatRooms);
router.get("/v1/chatbots/:chatbot_num/sessions", auth_1.default, chatRoomController_1.getChatbotSessions);
router.post('/v1/chatrooms/search', auth_1.default, chatRoomController_1.searchChatRooms);
router.get('/v1/chatrooms/:chatroom_id', auth_1.default, chatRoomController_1.getChatRoomById);
router.get('/v1/chatrooms/:chatroom_id/users', auth_1.default, chatRoomController_1.getConnectedUsers);
// GET /v1/chatrooms/:chatroom_id/user-movements
router.get('/v1/chatrooms/:chatroom_id/user-movements', auth_1.default, chatRoomController_1.getUserMovements);
router.post('/v1/chatbots/:chatbot_num/find-room', auth_1.default, chatRoomController_1.findRoom);
router.post('/v1/chatrooms/:chatroom_id/token', auth_1.default, chatRoomController_1.getRoomToken);
router.get("/v1/chatrooms/:chatroom_id/sessions", auth_1.default, chatRoomController_1.getChatroomSessions);
exports.default = router;
