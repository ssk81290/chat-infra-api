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
exports.getAllChatroomVMs = exports.getAllDbVMs = void 0;
const dbVM_1 = require("../models/dbVM"); // Database VM model
const infraDBConnection_1 = __importDefault(require("../utils/infraDBConnection"));
const chatRoomVM_1 = require("../models/chatRoomVM"); // ChatRoomVM model
// Get all database VMs with filtering and pagination
const DBVM = (0, dbVM_1.createDBVMModel)(infraDBConnection_1.default);
const ChatRoomVM = (0, chatRoomVM_1.createChatRoomVMModel)(infraDBConnection_1.default);
const getAllDbVMs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { cluster_id, zone, host, domain } = req.query;
    const { page_length = 20, page_num = 1 } = req.query;
    try {
        // Build query object for filtering
        const query = {};
        if (cluster_id)
            query.cluster_id = cluster_id;
        if (zone)
            query.zone = zone;
        if (host)
            query.host = host;
        if (domain)
            query.domain = domain;
        // Pagination logic
        const limit = parseInt(page_length, 10) || 20;
        const page = parseInt(page_num, 10) || 1;
        const skip = (page - 1) * limit;
        // Count the total number of VMs matching the query
        const total = yield DBVM.countDocuments(query);
        // Fetch the VMs with pagination
        const dbVms = yield DBVM.find(query)
            .skip(skip)
            .limit(limit);
        // Return the response with VM details
        return res.status(200).json({
            result: 200,
            page_length: limit,
            page_num: page,
            total,
            db_vms: dbVms.map(vm => ({
                cluster_id: vm.cluster_id,
                host: vm.host,
                domain: vm.domain,
                port: vm.port,
                username: vm.username,
                password: vm.password,
                zone: vm.zone,
                specs: vm.specs,
                status: vm.status,
                account: {
                    account_id: vm.account.account_id,
                    account_num: vm.account.account_num,
                    account_name: vm.account.account_name
                },
                chatbots: vm.chatbots,
                track: vm.track
            }))
        });
    }
    catch (error) {
        return res.status(500).json({
            result: 500,
            message: 'Error retrieving database VMs',
            error: "error.message"
        });
    }
});
exports.getAllDbVMs = getAllDbVMs;
// Get all chatroom VMs with filtering and pagination
const getAllChatroomVMs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { cluster_id, zone, host, domain, count_chatrooms } = req.query;
    const { page_length = 20, page_num = 1 } = req.query;
    try {
        // Build query object for filtering
        const query = {};
        if (cluster_id)
            query.cluster_id = cluster_id;
        if (zone)
            query.zone = zone;
        if (host)
            query.host = host;
        if (domain)
            query.domain = domain;
        // Filter for free VMs where count_chatrooms is 0
        if (count_chatrooms === '0')
            query.count_chatrooms = 0;
        // Pagination logic
        const limit = parseInt(page_length, 10) || 20;
        const page = parseInt(page_num, 10) || 1;
        const skip = (page - 1) * limit;
        // Count the total number of VMs matching the query
        const total = yield ChatRoomVM.countDocuments(query);
        // Fetch the VMs with pagination
        const chatroomVms = yield ChatRoomVM.find(query)
            .skip(skip)
            .limit(limit);
        // Return the response with VM details
        return res.status(200).json({
            result: 200,
            page_length: limit,
            page_num: page,
            total,
            chatroom_vms: chatroomVms.map(vm => ({
                cluster_id: vm.cluster_id,
                host: vm.host,
                domain: vm.domain,
                zone: vm.zone,
                specs: vm.specs,
                count_chatrooms: vm.count_chatrooms,
                track: vm.track
            }))
        });
    }
    catch (error) {
        return res.status(500).json({
            result: 500,
            message: 'Error retrieving chatroom VMs',
            error: "error.message"
        });
    }
});
exports.getAllChatroomVMs = getAllChatroomVMs;
