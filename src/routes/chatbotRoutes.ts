// src/routes/chatbotRoutes.ts
import express from 'express';
import {
    createChatbot,
    searchChatbots,
    getChatbot,
    updateChatbotProfile,
    updateChatbotStatus,
    updateChatbotTopics,
    updateChatbotChatDB,
    updateChatbotVectorDB,
    updateChatbotWebhook
} from '../controllers/chatbotController';
import basicAuthMiddleware from '../middleware/auth'; // Assuming you have basic auth middleware
import { createChatRoom, findRoom, getChatRoomById, getChatRooms, getConnectedUsers, getRoomToken, getUserMovements, searchChatRooms } from '../controllers/chatRoomController';
const router = express.Router();

// chatbot routes
router.post('/v1/chatbots', basicAuthMiddleware, createChatbot);
router.get('/v1/chatbots/:chatbot_num', basicAuthMiddleware, getChatbot);
router.post('/v1/chatbots/search', basicAuthMiddleware, searchChatbots);
router.patch('/v1/chatbots/:chatbot_num', basicAuthMiddleware, updateChatbotProfile);
router.patch('/v1/chatbots/:chatbot_num/status', basicAuthMiddleware, updateChatbotStatus);
router.patch('/v1/chatbots/:chatbot_num/topics', basicAuthMiddleware, updateChatbotTopics);
router.patch('/v1/chatbots/:chatbot_num/chat-db', basicAuthMiddleware, updateChatbotChatDB);
router.patch('/v1/chatbots/:chatbot_num/vector-db', basicAuthMiddleware, updateChatbotVectorDB);
router.patch('/v1/chatbots/:chatbot_num/webhook', basicAuthMiddleware, updateChatbotWebhook);


// chatroom routes

router.post('/v1/chatbots/:chatbot_num/chatrooms', basicAuthMiddleware, createChatRoom);
router.get('/v1/chatbots/:chatbot_num/chatrooms', basicAuthMiddleware, getChatRooms);

router.post('/v1/chatrooms/search', basicAuthMiddleware, searchChatRooms);
router.get('/v1/chatrooms/:chatroom_id', basicAuthMiddleware, getChatRoomById);
router.get('/v1/chatrooms/:chatroom_id/users', basicAuthMiddleware, getConnectedUsers);

// GET /v1/chatrooms/:chatroom_id/user-movements
router.get('/v1/chatrooms/:chatroom_id/user-movements', basicAuthMiddleware, getUserMovements);
router.post('/v1/chatbots/:chatbot_num/find-room', basicAuthMiddleware, findRoom);
router.post('/v1/chatrooms/:chatroom_id/token', basicAuthMiddleware, getRoomToken);


export default router;
