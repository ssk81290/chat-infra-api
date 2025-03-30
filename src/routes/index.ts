// src/routes/dbVMRoutes.ts
import express from 'express';
import { getAllChatroomVMs, getAllDbVMs } from '../controllers/dbVMController';
import basicAuthMiddleware from '../middleware/auth'; // Assuming Basic Auth Middleware
import { createIngestionTask, createTaskGroup, getTaskGroups, getTasks } from '../controllers/taskController';
import { createLandingPage, getLandingPage, searchLandingPages, updateLandingPage, updateLandingPageChatbot, updateLandingPageStatus } from '../controllers/landingPageController';
import { getClusterList } from "../controllers/CluserController";
const router = express.Router();

// GET /v1/db-vms
router.get('/v1/db-vms', basicAuthMiddleware, getAllDbVMs);
router.get('/v1/chatroom-vms', basicAuthMiddleware, getAllChatroomVMs);


router.get("/v1/clusters", basicAuthMiddleware, getClusterList)

//  landing page routes

router.post('/v1/landing-pages', basicAuthMiddleware, createLandingPage);

router.get('/v1/landing-pages/:landing_page_id', basicAuthMiddleware, getLandingPage);


router.post('/v1/landing-pages/search', basicAuthMiddleware, searchLandingPages);

// PATCH /v1/landing_pages/:landing_page_id
router.patch('/v1/landing-pages/:landing_page_id', basicAuthMiddleware, updateLandingPage);

// PATCH /v1/landing_pages/:landing_page_id/status
router.patch('/v1/landing-pages/:landing_page_id/status', basicAuthMiddleware, updateLandingPageStatus);

// PATCH /v1/landing_pages/:landing_page_id/chatbot
router.patch('/v1/landing-pages/:landing_page_id/chatbot', basicAuthMiddleware, updateLandingPageChatbot);
// data ingestion routes


router.post("/v1/data-ingestion/:chatbot_id/tasks", basicAuthMiddleware, createIngestionTask )
router.post("/v1/data-ingestion/:chatbot_id/task-groups", basicAuthMiddleware, createTaskGroup )

router.get("/v1/data-ingestion/tasks", basicAuthMiddleware, getTasks )
router.get("/v1/data-ingestion/task-groups", basicAuthMiddleware, getTaskGroups )

export default router;
