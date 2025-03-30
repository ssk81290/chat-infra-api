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
exports.updateAccountStatus = exports.updateAccountProfile = exports.searchAccounts = exports.getAccount = exports.createAccount = void 0;
const infraDBConnection_1 = __importDefault(require("../utils/infraDBConnection"));
const account_1 = require("../models/account");
const Account = (0, account_1.createAccountModel)(infraDBConnection_1.default);
// Create a new account
const createAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { cluster_id, cluster_num, access_id, access_num, customer_id, account_name, status, chatbot } = req.body;
    console.log("reqBody", req.body);
    // Generate a random 8-char account number
    const account_num = Math.random().toString(36).substring(2, 10).toUpperCase();
    try {
        const newAccount = new Account({
            cluster_id,
            cluster_num,
            access_id,
            access_num,
            customer_id,
            account_num,
            account_name,
            status,
            chatbot,
            track: { added: new Date(), modified: new Date() }
        });
        const savedAccount = yield newAccount.save();
        return res.status(200).json({
            result: 200,
            account: {
                account_id: savedAccount._id,
                account_num: savedAccount.account_num,
                account_name: savedAccount.account_name
            }
        });
    }
    catch (error) {
        console.log(error);
        res.status(400).json({ error: 'Error creating account' });
    }
});
exports.createAccount = createAccount;
// Get account information by account_num
const getAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { account_num } = req.params;
    try {
        // Find account by account_num
        const account = yield Account.findOne({ account_num });
        if (!account) {
            // Account not found, return error response
            return res.status(404).json({
                result: 404,
                error: 1008,
                msg: 'Account not found',
                desc: 'Specified Account Number is invalid.',
                data: {
                    account_num
                }
            });
        }
        // Account found, return the account details
        return res.status(200).json({
            result: 200,
            account: {
                account_id: account._id,
                customer_id: account.customer_id,
                account_num: account.account_num,
                account_name: account.account_name,
                status: account.status,
                chatbot: {
                    unlimited: account.chatbot.unlimited,
                    max_allowed: account.chatbot.max_allowed,
                    zones: account.chatbot.zones
                },
                track: {
                    added: account.track.added,
                    modified: account.track.modified,
                    activated: account.track.activated,
                    suspended: account.track.suspended
                }
            }
        });
    }
    catch (error) {
        // Internal server error
        return res.status(500).json({
            result: 500,
            message: 'Error retrieving account information',
            error: "error.message"
        });
    }
});
exports.getAccount = getAccount;
// Search accounts with filters, sorting, and pagination
const searchAccounts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { filter = {}, sort = {}, page = { length: 10, num: 1 } } = req.body;
    // Build filter query
    const query = {};
    // Apply filter conditions
    if (filter.account_num) {
        query.account_num = filter.account_num;
    }
    if (filter.account_name) {
        query.account_name = { $regex: filter.account_name, $options: 'i' }; // Case-insensitive search
    }
    if (filter.status) {
        query.status = filter.status;
    }
    if (filter.customer_id) {
        query.customer_id = filter.customer_id;
    }
    if (filter.add_date) {
        query['track.added'] = {
            $gte: new Date(filter.add_date.from),
            $lte: new Date(filter.add_date.to)
        };
    }
    if (filter.suspend_date) {
        query['track.suspended'] = {
            $gte: new Date(filter.suspend_date.from),
            $lte: new Date(filter.suspend_date.to)
        };
    }
    // Pagination
    const pageLength = page.length || 10;
    const pageNum = page.num || 1;
    const skip = (pageNum - 1) * pageLength;
    // Sorting
    const sortOptions = {};
    for (const [key, value] of Object.entries(sort)) {
        sortOptions[key] = value; // Sorting by specified fields
    }
    try {
        // Query for total count of accounts matching the filter
        const total = yield Account.countDocuments(query);
        // Query for filtered and paginated accounts
        const accounts = yield Account.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(pageLength);
        res.status(200).json({
            result: 200,
            page_length: pageLength,
            page_num: pageNum,
            total,
            accounts: accounts.map(account => ({
                account_id: account._id,
                account_num: account.account_num,
                account_name: account.account_name,
                customer_id: account.customer_id,
                status: account.status,
                chatbot: account.chatbot,
                track: account.track
            }))
        });
    }
    catch (error) {
        return res.status(500).json({
            result: 500,
            message: 'Error retrieving accounts',
            error: "error.message"
        });
    }
});
exports.searchAccounts = searchAccounts;
// Update account profile by account_num
const updateAccountProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { account_num } = req.params;
    const updateFields = req.body;
    try {
        // Find the account by account_num
        const account = yield Account.findOne({ account_num });
        if (!account) {
            return res.status(404).json({
                result: 404,
                msg: 'Account not found',
                data: {
                    account_num
                }
            });
        }
        // Update only the fields that are provided in the request body
        if (updateFields.account_name) {
            account.account_name = updateFields.account_name;
        }
        if (updateFields.customer_id) {
            account.customer_id = updateFields.customer_id;
        }
        if (updateFields.chatbot) {
            account.chatbot = Object.assign(Object.assign({}, account.chatbot), updateFields.chatbot // Merge with existing chatbot object
            );
        }
        // Update the track.modified field to the current date
        account.track.modified = new Date();
        // Save the updated account
        const updatedAccount = yield account.save();
        // Respond with the updated account information
        return res.status(200).json({
            result: 200,
            msg: `Account Profile for ${updatedAccount.account_name} is updated.`,
            data: {
                account_id: updatedAccount._id,
                account_name: updatedAccount.account_name
            }
        });
    }
    catch (error) {
        return res.status(500).json({
            result: 500,
            message: 'Error updating account profile',
            error: "error.message"
        });
    }
});
exports.updateAccountProfile = updateAccountProfile;
// Update account status by account_num
const updateAccountStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { account_num } = req.params;
    const { status } = req.body;
    try {
        // Find account by account_num
        const account = yield Account.findOne({ account_num });
        if (!account) {
            return res.status(404).json({
                result: 404,
                msg: 'Account not found',
                data: { account_num }
            });
        }
        // Update status
        account.status = status;
        // Update the appropriate track field
        if (status === 'suspended') {
            account.track.suspended = new Date();
        }
        else if (status === 'activated') {
            account.track.activated = new Date();
        }
        // Always update track.modified to the current date
        account.track.modified = new Date();
        // Save the updated account
        const updatedAccount = yield account.save();
        // Respond with the updated account status
        return res.status(200).json({
            result: 200,
            msg: `Account ${updatedAccount.account_name} is ${status}.`,
            data: {
                account_id: updatedAccount._id,
                account_name: updatedAccount.account_name
            }
        });
    }
    catch (error) {
        return res.status(500).json({
            result: 500,
            message: 'Error updating account status',
            error: "error.message"
        });
    }
});
exports.updateAccountStatus = updateAccountStatus;
