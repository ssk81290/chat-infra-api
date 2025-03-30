"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/dbVMRoutes.ts
const express_1 = __importDefault(require("express"));
const dbVMController_1 = require("../controllers/dbVMController");
const auth_1 = __importDefault(require("../middleware/auth")); // Assuming Basic Auth Middleware
const taskController_1 = require("../controllers/taskController");
const landingPageController_1 = require("../controllers/landingPageController");
const CluserController_1 = require("../controllers/CluserController");
const router = express_1.default.Router();
// GET /v1/db-vms
router.get('/v1/db-vms', auth_1.default, dbVMController_1.getAllDbVMs);
router.get('/v1/chatroom-vms', auth_1.default, dbVMController_1.getAllChatroomVMs);
router.get("/v1/clusters", auth_1.default, CluserController_1.getClusterList);
//  landing page routes
router.post('/v1/landing-pages', auth_1.default, landingPageController_1.createLandingPage);
router.get('/v1/landing-pages/:landing_page_id', auth_1.default, landingPageController_1.getLandingPage);
router.post('/v1/landing-pages/search', auth_1.default, landingPageController_1.searchLandingPages);
// PATCH /v1/landing_pages/:landing_page_id
router.patch('/v1/landing-pages/:landing_page_id', auth_1.default, landingPageController_1.updateLandingPage);
// PATCH /v1/landing_pages/:landing_page_id/status
router.patch('/v1/landing-pages/:landing_page_id/status', auth_1.default, landingPageController_1.updateLandingPageStatus);
// PATCH /v1/landing_pages/:landing_page_id/chatbot
router.patch('/v1/landing-pages/:landing_page_id/chatbot', auth_1.default, landingPageController_1.updateLandingPageChatbot);
// data ingestion routes
router.post("/v1/data-ingestion/:chatbot_id/tasks", auth_1.default, taskController_1.createIngestionTask);
router.post("/v1/data-ingestion/:chatbot_id/task-groups", auth_1.default, taskController_1.createTaskGroup);
router.get("/v1/data-ingestion/tasks", auth_1.default, taskController_1.getTasks);
router.get("/v1/data-ingestion/task-groups", auth_1.default, taskController_1.getTaskGroups);
exports.default = router;
