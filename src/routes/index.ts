// src/routes/dbVMRoutes.ts
import express from 'express';
import { getAllChatroomVMs, getAllDbVMs } from '../controllers/dbVMController';
import basicAuthMiddleware from '../middleware/auth'; // Assuming Basic Auth Middleware

const router = express.Router();

// GET /v1/db-vms
router.get('/v1/db-vms', basicAuthMiddleware, getAllDbVMs);
router.get('/v1/chatroom-vms', basicAuthMiddleware, getAllChatroomVMs);

export default router;
