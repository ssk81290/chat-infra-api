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
exports.getTasks = exports.getTaskGroups = exports.createTaskGroup = exports.createIngestionTask = void 0;
const infraDBConnection_1 = __importDefault(require("../utils/infraDBConnection"));
const chatbot_1 = require("../models/chatbot"); // Chatbot model
const task_1 = require("../models/task");
const taskGroup_1 = require("../models/taskGroup");
const rabbitMQ_1 = require("../utils/rabbitMQ");
const urlValidator_1 = require("../utils/urlValidator");
const dbValidator_1 = require("../utils/dbValidator");
const moment_1 = __importDefault(require("moment"));
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const mime_types_1 = __importDefault(require("mime-types"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const Task = (0, task_1.createTaskModel)(infraDBConnection_1.default);
const TaskGroup = (0, taskGroup_1.createTaskGroupModel)(infraDBConnection_1.default);
const chatbot = (0, chatbot_1.createChatbotModel)(infraDBConnection_1.default);
const TASK_TYPES = ['file', 'url', 'db'];
const GROUP_TASK_TYPES = ['website', 'sitemap'];
// Controller Function
const createIngestionTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const chatbot_id = req.params.chatbot_id;
    const { type, url, file, db, parent } = req.body;
    try {
        const chatbotDetails = yield chatbot.findOne({ chatbot_num: chatbot_id }); // Assuming Chatbot model exists
        if (!chatbotDetails) {
            return res.status(404).json({ result: 404, error: 'Chatbot not found' });
        }
        // Validate Task Type
        if (!TASK_TYPES.includes(type)) {
            return res.status(400).json({ result: 400, error: 'Invalid task type' });
        }
        // // Validate Parent
        // if (!parent || !parent.task_group_id || !parent.task_group_type) {
        //   return res.status(400).json({ result: 400, error: 'Invalid parent information' });
        // }
        let loader = '';
        if (type === 'url') {
            if (!(url === null || url === void 0 ? void 0 : url.url) || !(0, urlValidator_1.validateURL)(url.url)) {
                return res.status(400).json({ result: 400, error: 'Invalid or inaccessible URL' });
            }
            loader = 'url_loader'; // Set appropriate loader
        }
        if (type === 'db') {
            const connectionSuccess = yield (0, dbValidator_1.connectToDatabase)(db);
            if (!connectionSuccess) {
                return res.status(400).json({ result: 400, error: 'Database connection failed' });
            }
            loader = 'db_loader';
        }
        if (type === 'file') {
            loader = 'file_loader';
            fs_1.default.stat(file.file, (err, stats) => {
                if (err) {
                    return res.status(400).json({ result: 400, error: 'File not accessible' });
                }
                req.body[type].name = path_1.default.basename(file.file);
                req.body[type].size = stats.size;
                console.log(`Filename: ${path_1.default.basename(file.file)}`);
                console.log(`File size: ${stats.size} bytes`);
                console.log(`Mime: ${mime_types_1.default.lookup(file.file)}`);
            });
        }
        const taskData = {
            chatbot_id: chatbotDetails._id.toString(),
            account_id: chatbotDetails.account_id,
            account_num: chatbotDetails.account_num,
            chatbot_num: chatbotDetails.chatbot_num,
            type,
            [type]: req.body[type],
            status: 'queued',
            count: { embedding: 0 },
            track: {
                added: (0, moment_1.default)().toISOString(),
                queued: (0, moment_1.default)().toISOString(),
            },
        };
        const task = yield (0, task_1.createTaskModel)(infraDBConnection_1.default).create(taskData);
        // Post Task to RabbitMQ
        yield (0, rabbitMQ_1.publishToQueue)('enterprise_data_loading', {
            task_id: task._id,
            chatbot_id,
            operation: 'loader',
            loader,
            type,
        });
        res.status(200).json({ result: 200, task_id: task._id });
    }
    catch (error) {
        console.error('Error creating ingestion task:', error);
        res.status(500).json({ result: 500, error: 'Internal server error' });
    }
});
exports.createIngestionTask = createIngestionTask;
const createTaskGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const chatbot_id = req.params.chatbot_id;
    const { type, job_title, url, pre_process } = req.body;
    let website_url = url;
    try {
        // Validate Task Type
        if (!GROUP_TASK_TYPES.includes(type)) {
            return res.status(400).json({ result: 400, error: 'Invalid task type' });
        }
        // Validate Chatbot Ownership (example check)
        const chatbotDetails = yield chatbot.findOne({ chatbot_num: chatbot_id }); // Assuming Chatbot model exists
        if (!chatbotDetails) {
            return res.status(404).json({ result: 404, error: 'Chatbot not found' });
        }
        // Validate URL
        if (!website_url.startsWith('http://') && !website_url.startsWith('https://')) {
            return res.status(400).json({ result: 400, error: 'Invalid URL format. URL must start with http or https.' });
        }
        // const isURLAccessible = await validateURL(url);
        // if (!isURLAccessible) {
        //   return res.status(400).json({ result: 400, error: 'URL is not accessible or does not return HTTP 200.' });
        // }
        // // Additional validation for type=sitemap
        // if (type === 'sitemap' && !validateXMLFile(url)) {
        //   return res.status(400).json({ result: 400, error: 'Invalid Sitemap. URL must point to a valid XML file.' });
        // }
        // Create Task Group Data
        const taskGroupData = {
            account_id: chatbotDetails.account_id,
            account_num: chatbotDetails.account_num,
            chatbot_id: chatbotDetails._id,
            job_title: "importer",
            chatbot_num: chatbot_id,
            type,
            url: website_url,
            pre_process: pre_process || {},
            status: 'pending',
            count: {
                url_read: 0,
                done: 0,
                failed: 0,
            },
            track: {
                added: (0, moment_1.default)().toISOString(),
            },
        };
        const taskGroup = yield TaskGroup.create(taskGroupData);
        // Post to RabbitMQ
        yield (0, rabbitMQ_1.publishToQueue)('enterprise_data_loading', {
            task_id: taskGroup._id,
            chatbot_id: taskGroupData.chatbot_id,
            operation: 'importer',
            type,
            website_url,
        });
        // Send Response
        res.status(200).json({ result: 200, task_group_id: taskGroup._id });
    }
    catch (error) {
        console.error('Error creating task group:', error);
        res.status(500).json({ result: 500, error: error });
    }
});
exports.createTaskGroup = createTaskGroup;
const getPagination = (req) => {
    const pageNum = parseInt(req.query.page_num) || 1;
    const pageLength = parseInt(req.query.page_length) || 20;
    return { skip: (pageNum - 1) * pageLength, limit: pageLength, pageNum, pageLength };
};
/**
 * Get Task Groups with optional filters
 */
const getTaskGroups = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type, task_group_id, account_id, chatbot_id, account_num, chatbot_num, status } = req.query;
        const { skip, limit, pageNum, pageLength } = getPagination(req);
        // Construct filter query
        const filter = {};
        if (type)
            filter.type = type;
        if (task_group_id)
            filter._id = task_group_id;
        if (account_id)
            filter.account_id = account_id;
        if (account_num)
            filter.account_num = account_num;
        if (chatbot_id)
            filter.chatbot_num = chatbot_num;
        if (status)
            filter.status = status;
        // Fetch data
        const total = yield TaskGroup.countDocuments(filter);
        const taskGroups = yield TaskGroup.find(filter).skip(skip).limit(limit);
        return res.json({
            result: 200,
            page_length: pageLength,
            page_num: pageNum,
            total,
            task_groups: taskGroups,
        });
    }
    catch (error) {
        return res.status(500).json({ result: 500, error: "Internal Server Error" });
    }
});
exports.getTaskGroups = getTaskGroups;
/**
 * Get Individual Tasks with optional filters
 */
const getTasks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type, task_id, task_group_id, account_id, chatbot_id, account_num, chatbot_num, status } = req.query;
        const { skip, limit, pageNum, pageLength } = getPagination(req);
        // Construct filter query
        const filter = {};
        if (type)
            filter.type = type;
        if (task_id)
            filter._id = task_id;
        if (task_group_id)
            filter["parent.task_group_id"] = task_group_id || { $exists: false };
        if (account_id)
            filter.account_id = account_id;
        if (account_num)
            filter.account_num = account_num;
        if (chatbot_id)
            filter.chatbot_num = chatbot_num;
        //if (chatbot_num) filter.chatbot_num = chatbot_num;
        if (status)
            filter.status = status;
        // Fetch data
        const total = yield Task.countDocuments(filter);
        const tasks = yield Task.find(filter).skip(skip).limit(limit);
        return res.json({
            result: 200,
            page_length: pageLength,
            page_num: pageNum,
            total,
            tasks,
        });
    }
    catch (error) {
        return res.status(500).json({ result: 500, error: "Internal Server Error" });
    }
});
exports.getTasks = getTasks;
