// src/routes/chatbotRoutes.ts
import express from 'express';
import {
    createAccount,
    getAccount,
    searchAccounts,
    updateAccountProfile,
    updateAccountStatus
} from '../controllers/accountController';
import basicAuthMiddleware from '../middleware/auth';

const router = express.Router();

// POST /v1/chatbots
router.post('/account', basicAuthMiddleware, createAccount);
router.get('/account/:id', basicAuthMiddleware, getAccount);
router.post('/v1/accounts/search', basicAuthMiddleware, searchAccounts);
router.patch('/v1/accounts/:account_num', basicAuthMiddleware, updateAccountProfile);
router.patch('/v1/accounts/:account_num/status', basicAuthMiddleware, updateAccountStatus);



export default router;
