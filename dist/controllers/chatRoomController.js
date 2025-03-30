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
exports.getChatbotSessions = exports.getChatroomSessions = exports.getRoomToken = exports.findRoom = exports.getUserMovements = exports.getConnectedUsers = exports.getChatRoomById = exports.searchChatRooms = exports.getChatRooms = exports.createChatRoom = void 0;
const chatRoom_1 = require("../models/chatRoom"); // ChatRoom model
const infraDBConnection_1 = __importDefault(require("../utils/infraDBConnection"));
const chatRoomConnection_1 = __importDefault(require("../utils/chatRoomConnection"));
const chatbot_1 = require("../models/chatbot"); // Chatbot model
const user_1 = require("../models/user");
const userLog_1 = require("../models/userLog"); // UserLog model
const chatRoomToken_1 = require("../models/chatRoomToken"); // Token model
const chatRoomSession_1 = require("../models/chatRoomSession");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken")); // JWT for generating tokens
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
dotenv_1.default.config();
const User = (0, user_1.createUserModel)(chatRoomConnection_1.default);
const UserLog = (0, userLog_1.createUserLogModel)(chatRoomConnection_1.default);
const Chatbot = (0, chatbot_1.createChatbotModel)(infraDBConnection_1.default);
const ChatRoom = (0, chatRoom_1.createChatRoomModel)(infraDBConnection_1.default);
const Token = (0, chatRoomToken_1.createTokenModel)(chatRoomConnection_1.default);
const chatroomSession = (0, chatRoomSession_1.createChatroomSessionModel)(infraDBConnection_1.default);
// Create a new chat room under a chatbot
const createChatRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { chatbot_num } = req.params;
    const { chatroom_name, intent } = req.body;
    try {
        // Find the chatbot by chatbot_num
        const chatbot = yield Chatbot.findOne({ chatbot_num });
        if (!chatbot) {
            return res.status(404).json({
                result: 404,
                msg: 'Chatbot not found',
                data: { chatbot_num }
            });
        }
        // Create the new chat room with idle status and no host/domain
        const newChatRoom = new ChatRoom({
            cluster_id: chatbot.cluster_id,
            cluster_num: chatbot.cluster_num,
            account_id: chatbot.account_id,
            account_num: chatbot.account_num,
            account_name: chatbot.account_name,
            chatbot_id: chatbot._id,
            chatbot_num: chatbot.chatbot_num,
            chatbot_name: chatbot.chatbot_name,
            chatroom_name,
            intent: intent || {},
            status: 'idle',
            host: null,
            domain: chatbot.access.web.domains,
            in_session: {
                users: 0,
                bots: 0,
                agents: 0,
                viewers: 0
            },
            capacity: {
                users: chatbot.preferences.users,
                bots: chatbot.preferences.bots,
                agents: chatbot.preferences.agents,
                viewers: chatbot.preferences.viewers
            },
            track: {
                created: new Date()
            }
        });
        // Save the new chat room in the database
        const savedChatRoom = yield newChatRoom.save();
        // Return success response
        return res.status(200).json({
            result: 200,
            chatbot: {
                chatbot_id: chatbot._id,
                chatbot_num: chatbot.chatbot_num,
                chatbot_name: chatbot.chatbot_name
            },
            chatroom: {
                chatroom_id: savedChatRoom._id,
                chatroom_name: savedChatRoom.chatroom_name
            }
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            result: 500,
            message: 'Error creating chat room',
            error: "Error creating chat room"
        });
    }
});
exports.createChatRoom = createChatRoom;
// Get all chat rooms for a specific chatbot with filters and pagination
const getChatRooms = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { chatbot_num } = req.params;
    const { status, page_length = 20, page_num = 1 } = req.query;
    try {
        // Find the chatbot by chatbot_num to ensure it exists
        const chatbot = yield Chatbot.findOne({ chatbot_num });
        if (!chatbot) {
            return res.status(404).json({
                result: 404,
                msg: 'Chatbot not found',
                data: { chatbot_num }
            });
        }
        // Build query to find chat rooms
        const query = { chatbot_num };
        // Apply status filter if provided
        if (status) {
            query.status = status;
        }
        // Pagination logic
        const limit = parseInt(page_length, 10) || 20; // Default to 20
        const page = parseInt(page_num, 10) || 1; // Default to page 1
        const skip = (page - 1) * limit;
        // Find the total count of chat rooms matching the query
        const total = yield ChatRoom.countDocuments(query);
        // Find chat rooms with pagination
        const chatrooms = yield ChatRoom.find(query)
            .skip(skip)
            .limit(limit);
        // Respond with paginated chat rooms
        return res.status(200).json({
            result: 200,
            page_length: limit,
            page_num: page,
            total,
            chatrooms: chatrooms.map(chatroom => ({
                chatroom_id: chatroom._id,
                cluster_id: chatroom.cluster_id,
                cluster_num: chatroom.cluster_num,
                account_id: chatroom.account_id,
                account_num: chatroom.account_num,
                account_name: chatroom.account_name,
                chatbot_id: chatroom.chatbot_id,
                chatbot_num: chatroom.chatbot_num,
                chatbot_name: chatroom.chatbot_name,
                chatroom_name: chatroom.chatroom_name,
                status: chatroom.status,
                intent: chatroom.intent,
                host: chatroom.host,
                domain: chatroom.domain,
                capacity: chatroom.capacity,
                in_session: chatroom.in_session,
                track: chatroom.track
            }))
        });
    }
    catch (error) {
        return res.status(500).json({
            result: 500,
            message: 'Error retrieving chat rooms',
            error: "error.message"
        });
    }
});
exports.getChatRooms = getChatRooms;
// Search chat rooms across accounts and chatbots with filters, sorting, and pagination
const searchChatRooms = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { filter = {}, sort = {}, page = { length: 10, num: 1 } } = req.body;
    // Check for X-Action: search header
    if (req.headers['x-action'] !== 'search') {
        return res.status(400).json({ result: 400, message: 'Invalid action header' });
    }
    try {
        // Build the query object dynamically based on the filter provided
        const query = {};
        if (filter.cluster_id)
            query.cluster_id = filter.cluster_id;
        if (filter.account_num)
            query.account_num = filter.account_num;
        if (filter.account_id)
            query.account_id = filter.account_id;
        if (filter.chatbot_num)
            query.chatbot_num = filter.chatbot_num;
        if (filter.chatbot_id)
            query.chatbot_id = filter.chatbot_id;
        if (filter.chatroom_id)
            query._id = filter.chatroom_id; // _id field corresponds to chatroom_id
        if (filter.host)
            query.host = filter.host;
        if (filter.domain)
            query.domain = filter.domain;
        if (filter.status)
            query.status = filter.status;
        // Pagination logic
        const limit = page.length || 10;
        const pageNum = page.num || 1;
        const skip = (pageNum - 1) * limit;
        // Sorting logic
        const sortOptions = {};
        for (const [key, value] of Object.entries(sort)) {
            sortOptions[key] = value; // Sorting by specified fields
        }
        // Query the total number of chat rooms matching the filter
        const total = yield ChatRoom.countDocuments(query);
        // Fetch the chat rooms based on the filter, sorting, and pagination
        const chatrooms = yield ChatRoom.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(limit);
        // Return the paginated chat rooms list
        return res.status(200).json({
            result: 200,
            page_length: limit,
            page_num: pageNum,
            total,
            chatrooms: chatrooms.map(chatroom => ({
                chatroom_id: chatroom._id,
                cluster_id: chatroom.cluster_id,
                cluster_num: chatroom.cluster_num,
                account_id: chatroom.account_id,
                account_num: chatroom.account_num,
                account_name: chatroom.account_name,
                chatbot_id: chatroom.chatbot_id,
                chatbot_num: chatroom.chatbot_num,
                chatbot_name: chatroom.chatbot_name,
                chatroom_name: chatroom.chatroom_name,
                status: chatroom.status,
                intent: chatroom.intent,
                host: chatroom.host,
                domain: chatroom.domain,
                capacity: chatroom.capacity,
                in_session: chatroom.in_session,
                track: chatroom.track
            }))
        });
    }
    catch (error) {
        return res.status(500).json({
            result: 500,
            message: 'Error searching chat rooms',
            error: "error.message"
        });
    }
});
exports.searchChatRooms = searchChatRooms;
// Get a single chat room by chatroom_id
const getChatRoomById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { chatroom_id } = req.params;
    try {
        // Find chat room by its _id
        const chatroom = yield ChatRoom.findById(chatroom_id);
        // If chat room is not found
        if (!chatroom) {
            return res.status(404).json({
                result: 404,
                error: 1008,
                msg: 'Chatroom not found',
                desc: 'Specified Chatroom is invalid.',
                data: {
                    chatroom_id
                }
            });
        }
        // Return chat room information
        return res.status(200).json({
            result: 200,
            chatroom: {
                chatroom_id: chatroom._id,
                cluster_id: chatroom.cluster_id,
                cluster_num: chatroom.cluster_num,
                account_id: chatroom.account_id,
                account_num: chatroom.account_num,
                account_name: chatroom.account_name,
                chatbot_id: chatroom.chatbot_id,
                chatbot_num: chatroom.chatbot_num,
                chatbot_name: chatroom.chatbot_name,
                chatroom_name: chatroom.chatroom_name,
                status: chatroom.status,
                intent: chatroom.intent,
                host: chatroom.host,
                domain: chatroom.domain,
                capacity: chatroom.capacity,
                in_session: chatroom.in_session,
                track: chatroom.track
            }
        });
    }
    catch (error) {
        return res.status(500).json({
            result: 500,
            message: 'Error retrieving chat room',
            error: "error.message"
        });
    }
});
exports.getChatRoomById = getChatRoomById;
// Get connected users of a chat room
const getConnectedUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { chatroom_id } = req.params;
    const { role, session_id, page_length = 20, page_num = 1 } = req.query;
    try {
        // Find the chat room by chatroom_id
        const chatroom = yield ChatRoom.findById(chatroom_id);
        if (!chatroom) {
            return res.status(404).json({
                result: 404,
                error: 1008,
                msg: 'Chatroom not found',
                desc: 'Specified Chatroom is invalid.',
                data: {
                    chatroom_id
                }
            });
        }
        // Build the query to find connected users
        const query = { chatroom_id };
        // If role is provided, filter by role
        if (role) {
            query.role = role;
        }
        if (session_id) {
            query.session_id = session_id;
        }
        // Pagination
        const limit = parseInt(page_length, 10) || 20;
        const page = parseInt(page_num, 10) || 1;
        const skip = (page - 1) * limit;
        // Find total number of users matching the query
        const total = yield User.countDocuments(query);
        // Retrieve connected users based on filters and pagination
        const users = yield User.find(query)
            .skip(skip)
            .limit(limit);
        // Respond with the paginated user data
        return res.status(200).json({
            result: 200,
            page_length: limit,
            page_num: page,
            total,
            users: users.map(user => ({
                session_id: user.session_id,
                user_id: user._id,
                status: user.status,
                user_ref: user.user_ref,
                name: user.name,
                ip: user.ip,
                user_agent: user.user_agent,
                photo: user.photo,
                role: user.role,
                qualified: user.qualified,
                intent: user.intent,
                referral: user.referral,
                track: user.track
            }))
        });
    }
    catch (error) {
        return res.status(500).json({
            result: 500,
            message: 'Error retrieving users',
            error: "error.message"
        });
    }
});
exports.getConnectedUsers = getConnectedUsers;
// Get user movements (entry/exit logs) in a chat room
const getUserMovements = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { chatroom_id } = req.params;
    const { role, session_id, page_length = 20, page_num = 1 } = req.query;
    try {
        // Pagination
        const limit = parseInt(page_length, 10) || 20;
        const page = parseInt(page_num, 10) || 1;
        const skip = (page - 1) * limit;
        // Build query to fetch user movements
        const query = { chatroom_id };
        // If role is provided, filter by role
        if (role) {
            query.role = role;
        }
        if (session_id) {
            query.session_id = session_id;
        }
        // Count the total number of logs
        const total = yield UserLog.countDocuments(query);
        // Fetch the logs with pagination
        const logs = yield UserLog.find(query)
            .skip(skip)
            .limit(limit);
        // Respond with the logs
        return res.status(200).json({
            result: 200,
            page_length: limit,
            page_num: page,
            total,
            logs: logs.map(log => ({
                session_id: log.session_id,
                user_id: log.user_id,
                user_ref: log.user_ref,
                name: log.name,
                role: log.role,
                ip: log.ip,
                user_agent: log.user_agent,
                track: log.track
            }))
        });
    }
    catch (error) {
        return res.status(500).json({
            result: 500,
            message: 'Error retrieving user movements',
            error: "error.message"
        });
    }
});
exports.getUserMovements = getUserMovements;
// Function to find or create a chat room and generate a token
const findRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { chatbot_num } = req.params;
    const { user, intent, custom_data } = req.body;
    try {
        let chatroom;
        if (intent && Object.keys(intent).length === 0) {
            chatroom = yield ChatRoom.findOne({
                "chatbot_num": chatbot_num,
                $expr: {
                    $gt: ["$capacity.users", "$in_session.users"] // Compare capacity.users and in_session.users
                }
            });
        }
        else {
            chatroom = yield ChatRoom.findOne({
                "chatbot_num": chatbot_num,
                'intent': { $eq: intent },
                $expr: {
                    $gt: ["$capacity.users", "$in_session.users"] // Compare capacity.users and in_session.users
                }
            });
        }
        // Step 1: Search for an existing chat room that matches the intent and has available seats
        // Step 2: If no matching room, create a new one
        if (!chatroom) {
            const chatbot = yield Chatbot.findOne({ chatbot_num });
            if (!chatbot) {
                return res.status(404).json({
                    result: 404,
                    msg: 'Chatbot not found',
                    data: { chatbot_num }
                });
            }
            // Create the new chat room with idle status and no host/domain
            chatroom = new ChatRoom({
                cluster_id: chatbot.cluster_id,
                cluster_num: chatbot.cluster_num,
                account_id: chatbot.account_id,
                account_num: chatbot.account_num,
                account_name: chatbot.account_name,
                chatbot_id: chatbot._id,
                chatbot_num: chatbot.chatbot_num,
                chatbot_name: chatbot.chatbot_name,
                chatroom_name: chatbot.chatbot_name,
                intent: intent || {},
                status: 'idle',
                host: null,
                domain: chatbot.access.web.domains,
                in_session: {
                    users: 0,
                    bots: 0,
                    agents: 0,
                    viewers: 0
                },
                capacity: {
                    users: chatbot.preferences.users,
                    bots: chatbot.preferences.bots,
                    agents: chatbot.preferences.agents,
                    viewers: chatbot.preferences.viewers
                },
                track: {
                    created: new Date()
                }
            });
            // Save the new chat room in the database
            yield chatroom.save();
        }
        // Step 3: Generate a signed JWT token for the user to join the chat room
        const tokenData = {
            token_id: new mongoose_1.default.Types.ObjectId().toString(),
            chatbot_id: chatroom.chatbot_id,
            account_num: chatroom.account_num,
            chatbot_num: chatroom.chatbot_num,
            chatroom_id: chatroom._id.toString(),
            host: chatroom.host || 'default-host',
            domain: chatroom.domain || 'chat.example.com',
            expiry: Math.floor(Date.now() / 1000) + (60 * 30),
            user: {
                user_ref: user.user_ref || 'viewer',
                name: user.name || 'viewer',
                role: user.role,
                ip: user.ip,
                user_agent: user.user_agent,
                photo: user.photo
            },
            intent,
            custom_data: custom_data
        };
        const token = jsonwebtoken_1.default.sign(tokenData, process.env.JWT_SECRET, {
            expiresIn: '300m' // Token valid for 30 minutes
        });
        // Step 4: Store the token in the token collection for validation later
        const newTokenEntry = new Token({
            token_id: tokenData.token_id,
            chatbot_id: chatroom.chatbot_id,
            chatroom_id: chatroom._id,
            host: chatroom.host || 'default-host',
            domain: chatroom.domain || 'chat.example.com',
            user_ref: user.user_ref || "viewer",
            photo: user.photo,
            name: user.name || 'viewer',
            role: user.role || 'viewer',
            issued: new Date(),
            expiry: new Date(Date.now() + 30 * 60000), // Expiry in 30 minutes
        });
        yield newTokenEntry.save();
        // Step 5: Respond with the token and chat room details
        return res.status(200).json({
            result: 200,
            token,
            url: `https://${chatroom.domain}?token=${token}`,
            data: {
                host: chatroom.host || 'default-host',
                domain: chatroom.domain || 'chat.example.com',
                chatroom_id: chatroom._id.toString(),
                role: user.role || 'viewer',
                name: user.name || 'viewer'
            }
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            result: 500,
            message: 'Error finding or creating room',
            error: "error.message"
        });
    }
});
exports.findRoom = findRoom;
// Function to generate a token for accessing a known chat room
const getRoomToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { chatroom_id } = req.params;
    const { user, intent, custom_data } = req.body;
    try {
        // Step 1: Retrieve the chat room by chatroom_id
        const chatroom = yield ChatRoom.findById(chatroom_id);
        if (!chatroom) {
            return res.status(404).json({
                result: 404,
                msg: 'Chatroom not found',
                data: {
                    chatroom_id
                }
            });
        }
        // Step 2: Generate a signed JWT token for the user to join the chat room
        const tokenData = {
            token_id: new mongoose_1.default.Types.ObjectId().toString(),
            chatbot_id: chatroom.chatbot_id.toString(),
            chatroom_id: chatroom._id.toString(),
            account_num: chatroom.account_num,
            chatbot_num: chatroom.chatbot_num,
            host: chatroom.host || 'default-host',
            domain: chatroom.domain || 'chat.example.com',
            expiry: Math.floor(Date.now() / 1000) + (60 * 30),
            user: {
                user_ref: user.user_ref || "viewer",
                name: user.name || 'viewer',
                role: user.role || 'viewer ',
                ip: user.ip,
                user_agent: user.user_agent,
                photo: user.photo
            },
            intent,
            custom_data: custom_data
        };
        const token = jsonwebtoken_1.default.sign(tokenData, process.env.JWT_SECRET, {
            expiresIn: '300m' // Token valid for 30 minutes
        });
        // Step 3: Store the token in the token collection for validation later
        const newTokenEntry = new Token({
            token_id: tokenData.token_id,
            chatbot_id: chatroom.chatbot_id,
            chatroom_id: chatroom._id,
            host: chatroom.host || 'default-host',
            domain: chatroom.domain || 'chat.example.com',
            user_ref: user.user_ref || "viewer",
            name: user.name || 'Guest',
            photo: user.photo,
            role: user.role,
            issued: new Date(),
            expiry: new Date(Date.now() + 30 * 60000), // Expiry in 30 minutes
        });
        yield newTokenEntry.save();
        // Step 4: Respond with the token and chat room details
        return res.status(200).json({
            result: 200,
            token,
            url: `https://${chatroom.domain}?token=${token}`,
            data: {
                host: chatroom.host || 'default-host',
                domain: chatroom.domain || 'chat.example.com',
                chatroom_id: chatroom._id.toString(),
                role: user.role || 'viewer',
                name: user.name || 'viewer'
            }
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            result: 500,
            message: 'Error generating room token',
            error: "error.message"
        });
    }
});
exports.getRoomToken = getRoomToken;
const getChatroomSessions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chatroom_id } = req.params;
        let { start_date, end_date, page_length, page_num } = req.query;
        // Default values for pagination
        const limit = page_length ? parseInt(page_length, 10) : 20;
        const page = page_num ? parseInt(page_num, 10) : 1;
        const skip = (page - 1) * limit;
        // Set default start and end date as today if not provided
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));
        const startDate = start_date ? new Date(start_date) : startOfDay;
        const endDate = end_date ? new Date(end_date) : endOfDay;
        // Find sessions for the given chatroom within the date range
        const sessions = yield chatroomSession.find({
            chatroom_id,
            session_start: { $gte: startDate, $lte: endDate },
        })
            .skip(skip)
            .limit(limit)
            .sort({ session_start: -1 });
        // If no sessions found, return an error response
        if (!sessions.length) {
            return res.status(404).json({
                result: 404,
                error: 1008,
                msg: "Chatroom not found",
                desc: "Specified Chatroom is invalid or has no sessions in the given timeframe.",
                data: { chatroom_id },
            });
        }
        // Get total count of sessions
        const total = yield chatroomSession.countDocuments({
            chatroom_id,
            session_start: { $gte: startDate, $lte: endDate },
        });
        // Format the response
        res.status(200).json({
            result: 200,
            page_length: limit,
            page_num: page,
            total,
            chatroom_id,
            sessions: sessions.map((session) => ({
                session_id: session._id,
                session_start: session.session_start,
                session_stop: session.session_stop,
                count: session.count,
            })),
        });
    }
    catch (error) {
        console.error("Error fetching chatroom sessions:", error);
        res.status(500).json({
            result: 500,
            msg: "Internal Server Error",
        });
    }
});
exports.getChatroomSessions = getChatroomSessions;
const getChatbotSessions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chatbot_num } = req.params;
        let { start_date, end_date, page_length, page_num } = req.query;
        // Default values for pagination
        const limit = page_length ? parseInt(page_length, 10) : 20;
        const page = page_num ? parseInt(page_num, 10) : 1;
        const skip = (page - 1) * limit;
        // Set default start and end date as today if not provided
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));
        const startDate = start_date ? new Date(start_date) : startOfDay;
        const endDate = end_date ? new Date(end_date) : endOfDay;
        // Find sessions for all chatrooms under the given chatbot within the date range
        const sessions = yield chatroomSession.find({
            chatbot_num,
            session_start: { $gte: startDate, $lte: endDate },
        })
            .skip(skip)
            .limit(limit)
            .sort({ session_start: -1 });
        // If no sessions found, return an error response
        if (!sessions.length) {
            return res.status(404).json({
                result: 404,
                error: 1008,
                msg: "Chatbot not found",
                desc: "Specified Chatbot is invalid or has no sessions in the given timeframe.",
                data: { chatbot_num },
            });
        }
        // Get total count of sessions
        const total = yield chatroomSession.countDocuments({
            chatbot_num,
            session_start: { $gte: startDate, $lte: endDate },
        });
        // Format the response
        res.status(200).json({
            result: 200,
            page_length: limit,
            page_num: page,
            total,
            chatbot_num,
            sessions: sessions.map((session) => ({
                chatroom_id: session.chatroom_id,
                session_id: session._id,
                session_start: session.session_start,
                session_stop: session.session_stop,
                count: session.count,
            })),
        });
    }
    catch (error) {
        console.error("Error fetching chatbot sessions:", error);
        res.status(500).json({
            result: 500,
            msg: "Internal Server Error",
        });
    }
});
exports.getChatbotSessions = getChatbotSessions;
