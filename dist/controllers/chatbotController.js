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
exports.updateChatbotPrompt = exports.updateChatbotAIModels = exports.updateChatbotWebhook = exports.updateChatbotVectorDB = exports.updateChatbotChatDB = exports.updateChatbotTopics = exports.updateChatbotStatus = exports.updateChatbotProfile = exports.searchChatbots = exports.getChatbot = exports.createChatbot = void 0;
const infraDBConnection_1 = __importDefault(require("../utils/infraDBConnection"));
const chatbot_1 = require("../models/chatbot"); // Chatbot model
const account_1 = require("../models/account");
const aiModel_1 = require("../models/aiModel");
const queryProcessor_1 = require("../models/queryProcessor");
const dbVM_1 = require("../models/dbVM");
const Cluster_1 = require("../models/Cluster");
const Chatbot = (0, chatbot_1.createChatbotModel)(infraDBConnection_1.default);
const Account = (0, account_1.createAccountModel)(infraDBConnection_1.default);
const aiModel = (0, aiModel_1.createAIModel)(infraDBConnection_1.default);
const queryProcessor = (0, queryProcessor_1.createQueryProcessorModel)(infraDBConnection_1.default);
const vmDbs = (0, dbVM_1.createDBVMModel)(infraDBConnection_1.default);
const cluster = (0, Cluster_1.createCluster)(infraDBConnection_1.default);
// Create a new chatbot
const createChatbot = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { cluster_num, access_id, access_num, customer_id, account_num, chatbot_name, preferences = {}, access, mode } = req.body;
    // Generate a chatbot_num (random alphanumeric string, 10 characters)
    const chatbot_num = `GCB-${Math.random()
        .toString(36)
        .substring(2, 10)
        .toUpperCase()}`;
    const accountData = yield Account.findOne({ account_num: account_num });
    if (!accountData) {
        return res.status(401).send("Invalid Account number provided");
    }
    const cluster_query = {};
    if (!cluster_num) {
        cluster_query.cluster_num = accountData.cluster_num;
    }
    else {
        cluster_query.cluster_num = accountData.cluster_num;
    }
    const cluster_details = yield cluster.findOne(cluster_query);
    const aiModelDetails = yield aiModel.find({ default: true });
    if (aiModelDetails) {
        aiModelDetails.forEach((item) => {
            if (item.type == "llm") {
                preferences.embeddings = {
                    model: item.model,
                    platform: item.platform,
                    native: true,
                };
            }
            if (item.type == "embed") {
                preferences.query = {
                    llm: item.model,
                    platform: item.platform,
                    native: true,
                };
            }
        });
    }
    const queryProcessorDetails = yield queryProcessor.find({ default: true, mode: mode });
    if (queryProcessorDetails) {
        queryProcessorDetails.forEach((item) => {
            preferences.bot = {
                processor: item.processor,
                name: item.processor,
                avatar: item.avatar,
                script: item.script,
                path: item.path,
            };
        });
    }
    let vector_db = {};
    const vmDetails = yield vmDbs.findOne({ "default": true, status: "open" });
    if (vmDetails) {
        vector_db = {
            type: `${vmDetails.type}`,
            host: `${vmDetails.host}`,
            port: `${vmDetails.port}`,
            namespace: "bot1",
            collection: `bot_${chatbot_num}`,
            username: `${vmDetails.username}`,
            password: `${vmDetails.password}`,
        };
    }
    //    console.log(vectorDb);
    let accountDetails = accountData.toJSON();
    let account_id = accountDetails._id;
    let account_name = accountDetails.account_name;
    try {
        // Create the chatbot document
        const newChatbot = new Chatbot({
            cluster_num,
            access_id,
            access_num,
            account_id,
            account_num,
            account_name,
            chatbot_num,
            chatbot_name,
            mode: mode,
            status: "active",
            preferences,
            vector_db: vector_db,
            access,
            track: { added: new Date(), modified: new Date() },
        });
        if (cluster_details) {
            newChatbot.cluster_id = cluster_details._id;
            newChatbot.cluster_name = cluster_details.cluster_name;
            newChatbot.flag = cluster_details.flag;
        }
        let newChatbotData = yield newChatbot.save();
        res.status(200).json({
            result: 200,
            account: {
                chatbot_id: newChatbotData._id,
                chatbot_num: chatbot_num,
                chatbot_name: chatbot_name,
            },
        });
    }
    catch (error) {
        console.log(error);
        res.status(400).json({ error: "Error creating chatbot" });
    }
});
exports.createChatbot = createChatbot;
// get chatbot
const getChatbot = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { chatbot_num } = req.params;
    try {
        // Find the chatbot by chatbot_num
        const chatbot = yield Chatbot.findOne({ chatbot_num });
        if (!chatbot) {
            return res.status(404).json({
                result: 404,
                message: "Chatbot not found",
            });
        }
        // Send chatbot information
        res.status(200).json({
            result: 200,
            chatbot: {
                chatbot_id: chatbot._id,
                cluster_num: chatbot.cluster_num,
                cluster_name: chatbot.cluster_name,
                flag: chatbot.flag,
                access_num: chatbot.access_num,
                account_num: chatbot.account_num,
                account_name: chatbot.account_name,
                chatbot_num: chatbot.chatbot_num,
                chatbot_name: chatbot.chatbot_name,
                status: chatbot.status,
                prompt: chatbot.prompt,
                preferences: chatbot.preferences,
                topics: chatbot.topics,
                chat_db: chatbot.chat_db,
                ai_db: chatbot.vector_db,
                webhook: chatbot.webhook,
                track: chatbot.track,
                mode: chatbot.mode
            },
        });
    }
    catch (error) {
        return res.status(200).json({
            result: 404,
            error: 1008,
            msg: "Chatbot not found",
            desc: "Specified Chatbot Number is invalid.",
            data: {
                chatbot_num: chatbot_num,
            },
        });
    }
});
exports.getChatbot = getChatbot;
// search chatbots
const searchChatbots = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { filter = {}, sort = {}, page = { length: 10, num: 1 } } = req.body;
    // Build filter query
    const query = {};
    // Apply filter conditions
    if (filter.account_num) {
        query.account_num = filter.account_num;
    }
    if (filter.cluster_num) {
        query.cluster_num = filter.cluster_num;
    }
    if (filter.chatbot_num) {
        query.chatbot_num = filter.chatbot_num;
    }
    if (filter.status) {
        query.status = filter.status;
    }
    if (filter.add_date) {
        query["track.added"] = {
            $gte: new Date(filter.add_date.from),
            $lte: new Date(filter.add_date.to),
        };
    }
    if (filter.suspend_date) {
        query["track.suspended"] = {
            $gte: new Date(filter.suspend_date.from),
            $lte: new Date(filter.suspend_date.to),
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
        // Query for total count of chatbots matching the filter
        const total = yield Chatbot.countDocuments(query);
        // Query for filtered and paginated chatbots
        const chatbots = yield Chatbot.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(pageLength);
        res.status(200).json({
            result: 200,
            page_length: pageLength,
            page_num: pageNum,
            total,
            chatbots,
        });
    }
    catch (error) {
        res.status(500).json({
            result: 500,
            message: "Error retrieving chatbots",
            error: "",
        });
    }
});
exports.searchChatbots = searchChatbots;
const updateChatbotProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { chatbot_num } = req.params;
    const updateFields = req.body;
    try {
        // Find chatbot by chatbot_num
        const chatbot = yield Chatbot.findOne({ chatbot_num });
        if (!chatbot) {
            return res.status(404).json({
                result: 404,
                message: `Chatbot with number ${chatbot_num} not found`,
            });
        }
        // Update only the fields that are provided
        if (updateFields.chatbot_name) {
            chatbot.chatbot_name = updateFields.chatbot_name;
        }
        if (updateFields.preferences) {
            chatbot.preferences = Object.assign(Object.assign({}, chatbot.preferences), updateFields.preferences);
        }
        if (updateFields.access) {
            chatbot.access = Object.assign(Object.assign({}, chatbot.access), updateFields.access);
        }
        // Update track.modified to current date
        chatbot.track.modified = new Date();
        // Save updated chatbot
        const updatedChatbot = yield chatbot.save();
        res.status(200).json({
            result: 200,
            msg: `Chatbot profile for ${updatedChatbot.chatbot_name} is updated.`,
            data: {
                account_id: updatedChatbot.account_id,
                account_num: updatedChatbot.account_num,
                chatbot_id: updatedChatbot._id,
                chatbot_num: updatedChatbot.chatbot_num,
            },
        });
    }
    catch (error) {
        console.log("error", error);
        return res.status(500).json({
            result: 500,
            message: "Error updating chatbot profile",
            error: "error.message",
        });
    }
});
exports.updateChatbotProfile = updateChatbotProfile;
// update chatbot status
const updateChatbotStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { chatbot_num } = req.params;
    const { status } = req.body;
    console.log("status1", req.body);
    if (!status) {
        return res.status(400).json({
            result: 400,
            message: "Status field is required",
        });
    }
    try {
        // Find chatbot by chatbot_num
        const chatbot = yield Chatbot.findOne({ chatbot_num });
        if (!chatbot) {
            return res.status(404).json({
                result: 404,
                message: `Chatbot with number ${chatbot_num} not found`,
            });
        }
        // Update status
        chatbot.status = status;
        // Update track fields based on the new status
        if (status === "suspended") {
            chatbot.track.suspended = new Date();
        }
        else if (status === "activated") {
            chatbot.track.activated = new Date();
        }
        // Save updated chatbot
        const updatedChatbot = yield chatbot.save();
        res.status(200).json({
            result: 200,
            msg: `Chatbot ${updatedChatbot.chatbot_name} is ${updatedChatbot.status}.`,
            data: {
                account_id: updatedChatbot.account_id,
                account_num: updatedChatbot.account_num,
                chatbot_id: updatedChatbot._id,
                chatbot_num: updatedChatbot.chatbot_num,
                chatbot_name: updatedChatbot.chatbot_name,
                status: updatedChatbot.status,
            },
        });
    }
    catch (error) {
        return res.status(500).json({
            result: 500,
            message: "Error updating chatbot status",
            error: "error.message",
        });
    }
});
exports.updateChatbotStatus = updateChatbotStatus;
// update chatbot topic
const updateChatbotTopics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { chatbot_num } = req.params;
    const topics = req.body.topics;
    console.log(topics);
    // Ensure topics is an array
    if (!Array.isArray(topics)) {
        return res.status(400).json({
            result: 400,
            message: "Topics must be an array of strings",
        });
    }
    try {
        // Find chatbot by chatbot_num
        const chatbot = yield Chatbot.findOne({ chatbot_num });
        if (!chatbot) {
            return res.status(404).json({
                result: 404,
                message: `Chatbot with number ${chatbot_num} not found`,
            });
        }
        // Overwrite the topics array
        chatbot.topics = topics;
        // Update track.modified to current date
        chatbot.track.modified = new Date();
        // Save updated chatbot
        const updatedChatbot = yield chatbot.save();
        res.status(200).json({
            result: 200,
            msg: `Topics updated for Chatbot ${updatedChatbot.chatbot_name}.`,
            data: {
                account_id: updatedChatbot.account_id,
                account_num: updatedChatbot.account_num,
                chatbot_id: updatedChatbot._id,
                chatbot_num: updatedChatbot.chatbot_num,
                chatbot_name: updatedChatbot.chatbot_name,
            },
        });
    }
    catch (error) {
        return res.status(500).json({
            result: 500,
            message: "Error updating chatbot topics",
            error: "message",
        });
    }
});
exports.updateChatbotTopics = updateChatbotTopics;
// Update chatbot chat_db by chatbot_num
const updateChatbotChatDB = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { chatbot_num } = req.params;
    const { host, port, namespace, username, password } = req.body;
    // Ensure required fields are provided
    if (!host || !port || !namespace || !username || !password) {
        return res.status(400).json({
            result: 400,
            message: "All chat_db fields (host, port, namespace, username, password) are required",
        });
    }
    try {
        // Find chatbot by chatbot_num
        const chatbot = yield Chatbot.findOne({ chatbot_num });
        if (!chatbot) {
            return res.status(404).json({
                result: 404,
                message: `Chatbot with number ${chatbot_num} not found`,
            });
        }
        // Update chat_db fields
        chatbot.chat_db = {
            host,
            port,
            namespace,
            username,
            password,
        };
        // Update track.modified to current date
        chatbot.track.modified = new Date();
        // Save updated chatbot
        const updatedChatbot = yield chatbot.save();
        res.status(200).json({
            result: 200,
            msg: `Chat Database information updated for Chatbot ${updatedChatbot.chatbot_name}.`,
            data: {
                account_id: updatedChatbot.account_id,
                account_num: updatedChatbot.account_num,
                chatbot_id: updatedChatbot._id,
                chatbot_num: updatedChatbot.chatbot_num,
                chatbot_name: updatedChatbot.chatbot_name,
            },
        });
    }
    catch (error) {
        return res.status(500).json({
            result: 500,
            message: "Error updating chatbot Chat-DB information",
            error: "error.message",
        });
    }
});
exports.updateChatbotChatDB = updateChatbotChatDB;
// Update chatbot vector_db by chatbot_num
const updateChatbotVectorDB = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { chatbot_num } = req.params;
    const vectorDBUpdate = req.body;
    // Ensure the payload is not empty
    if (Object.keys(vectorDBUpdate).length === 0) {
        return res.status(400).json({
            result: 400,
            message: "Payload cannot be an empty object",
        });
    }
    try {
        // Find chatbot by chatbot_num
        const chatbot = yield Chatbot.findOne({ chatbot_num });
        if (!chatbot) {
            return res.status(404).json({
                result: 404,
                message: `Chatbot with number ${chatbot_num} not found`,
            });
        }
        // Update only the provided vector_db fields
        chatbot.vector_db = Object.assign(Object.assign({}, chatbot.vector_db), vectorDBUpdate);
        // Update track.modified to the current date
        chatbot.track.modified = new Date();
        // Save updated chatbot
        const updatedChatbot = yield chatbot.save();
        res.status(200).json({
            result: 200,
            msg: `Vector Database information updated for Chatbot ${updatedChatbot.chatbot_name}.`,
            data: {
                account_id: updatedChatbot.account_id,
                account_num: updatedChatbot.account_num,
                chatbot_id: updatedChatbot._id,
                chatbot_num: updatedChatbot.chatbot_num,
                chatbot_name: updatedChatbot.chatbot_name,
            },
        });
    }
    catch (error) {
        return res.status(500).json({
            result: 500,
            message: "Error updating chatbot Vector-DB information",
            error: "error.message",
        });
    }
});
exports.updateChatbotVectorDB = updateChatbotVectorDB;
// Update chatbot webhook by chatbot_num
const updateChatbotWebhook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { chatbot_num } = req.params;
    const webhookUpdate = req.body;
    // Ensure the payload is not empty
    if (Object.keys(webhookUpdate).length === 0) {
        return res.status(400).json({
            result: 400,
            message: "Payload cannot be an empty object",
        });
    }
    try {
        // Find chatbot by chatbot_num
        const chatbot = yield Chatbot.findOne({ chatbot_num });
        if (!chatbot) {
            return res.status(404).json({
                result: 404,
                message: `Chatbot with number ${chatbot_num} not found`,
            });
        }
        // Update only the provided webhook fields
        chatbot.webhook = Object.assign(Object.assign({}, chatbot.webhook), webhookUpdate);
        // Update track.modified to the current date
        chatbot.track.modified = new Date();
        // Save updated chatbot
        const updatedChatbot = yield chatbot.save();
        res.status(200).json({
            result: 200,
            msg: `Webhook information updated for Chatbot ${updatedChatbot.chatbot_name}.`,
            data: {
                account_id: updatedChatbot.account_id,
                account_num: updatedChatbot.account_num,
                chatbot_id: updatedChatbot._id,
                chatbot_num: updatedChatbot.chatbot_num,
                chatbot_name: updatedChatbot.chatbot_name,
            },
        });
    }
    catch (error) {
        return res.status(500).json({
            result: 500,
            message: "Error updating chatbot webhook information",
            error: "error.message",
        });
    }
});
exports.updateChatbotWebhook = updateChatbotWebhook;
const updateChatbotAIModels = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { chatbot_num } = req.params;
    const { embeddings, query } = req.body;
    try {
        if (!embeddings && !query) {
            return res.status(400).json({
                result: 400,
                error: 'Payload cannot be empty',
                msg: 'Either embeddings or query object must be provided.',
            });
        }
        const Chatbot = (0, chatbot_1.createChatbotModel)(infraDBConnection_1.default);
        // Find chatbot by chatbot_num
        const chatbot = yield Chatbot.findOne({ chatbot_num });
        if (!chatbot) {
            return res.status(404).json({
                result: 404,
                error: 1009,
                msg: 'Chatbot not found',
                desc: 'Specified Chatbot is invalid.',
                data: { chatbot_num },
            });
        }
        // Update embeddings model information if provided
        if (embeddings) {
            chatbot.preferences.embeddings = Object.assign(Object.assign({}, chatbot.preferences.embeddings), embeddings);
        }
        // Update query model information if provided
        if (query) {
            chatbot.preferences.query = Object.assign(Object.assign({}, chatbot.preferences.query), query);
        }
        // Update track.modified timestamp
        chatbot.track.modified = new Date();
        // Save the updated chatbot
        const updatedChatbot = yield chatbot.save();
        // Response
        res.status(200).json({
            result: 200,
            msg: `AI Model information updated for Chatbot ${updatedChatbot.chatbot_name}.`,
            data: {
                account_id: updatedChatbot.account_id,
                account_num: updatedChatbot.account_num,
                chatbot_id: updatedChatbot._id,
                chatbot_num: updatedChatbot.chatbot_num,
                chatbot_name: updatedChatbot.chatbot_name,
            },
        });
    }
    catch (error) {
        console.error('Error updating AI Models:', error);
        res.status(500).json({
            result: 500,
            error: 'Internal Server Error',
        });
    }
});
exports.updateChatbotAIModels = updateChatbotAIModels;
const updateChatbotPrompt = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { chatbot_num } = req.params;
    const { persona, persona_obj, instructions, collect, extra } = req.body;
    try {
        if (!persona && !instructions && !collect && !extra && !persona_obj) {
            return res.status(400).json({
                result: 400,
                error: 'Payload cannot be empty',
                msg: 'At least one field must be provided in the payload.',
            });
        }
        const Chatbot = (0, chatbot_1.createChatbotModel)(infraDBConnection_1.default);
        // Find chatbot by chatbot_num
        const chatbot = yield Chatbot.findOne({ chatbot_num });
        if (!chatbot) {
            return res.status(404).json({
                result: 404,
                error: 1009,
                msg: 'Chatbot not found',
                desc: 'Specified Chatbot is invalid.',
                data: { chatbot_num },
            });
        }
        // Update prompt fields if provided in the request
        if (persona !== undefined)
            chatbot.prompt.persona = persona;
        if (persona_obj !== undefined)
            chatbot.prompt.persona_obj = persona_obj;
        if (instructions !== undefined) {
            chatbot.prompt.instructions = Object.assign(Object.assign({}, chatbot.prompt.instructions), instructions);
        }
        if (collect !== undefined) {
            chatbot.prompt.collect = Object.assign(Object.assign({}, chatbot.prompt.collect), collect);
        }
        if (extra !== undefined) {
            chatbot.prompt.extra = Object.assign(Object.assign({}, chatbot.prompt.extra), extra);
        }
        // Update track.modified timestamp
        chatbot.track.modified = new Date();
        // Save the updated chatbot
        const updatedChatbot = yield chatbot.save();
        // Response
        res.status(200).json({
            result: 200,
            msg: `Prompt updated for Chatbot ${updatedChatbot.chatbot_name}.`,
            data: {
                account_id: updatedChatbot.account_id,
                account_num: updatedChatbot.account_num,
                chatbot_id: updatedChatbot._id,
                chatbot_num: updatedChatbot.chatbot_num,
                chatbot_name: updatedChatbot.chatbot_name,
            },
        });
    }
    catch (error) {
        console.error('Error updating Prompt:', error);
        res.status(500).json({
            result: 500,
            error: 'Internal Server Error',
        });
    }
});
exports.updateChatbotPrompt = updateChatbotPrompt;
