"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/chatbotRoutes.ts
const express_1 = __importDefault(require("express"));
const accountController_1 = require("../controllers/accountController");
const auth_1 = __importDefault(require("../middleware/auth"));
const router = express_1.default.Router();
// POST /v1/chatbots
router.post('/v1/account', auth_1.default, accountController_1.createAccount);
router.get('/v1/account/:id', auth_1.default, accountController_1.getAccount);
router.post('/v1/accounts/search', auth_1.default, accountController_1.searchAccounts);
router.patch('/v1/accounts/:account_num', auth_1.default, accountController_1.updateAccountProfile);
router.patch('/v1/accounts/:account_num/status', auth_1.default, accountController_1.updateAccountStatus);
exports.default = router;
