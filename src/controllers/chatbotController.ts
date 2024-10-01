// src/controllers/chatbotController.ts
import { Request, Response } from 'express';
import Chatbot from '../models/chatbot';

// Create a new chatbot
export const createChatbot = async (req: Request, res: Response) => {
    const { account_num, chatbot_name, preferences, access } = req.body;

    // Generate a chatbot_num (random alphanumeric string, 10 characters)
    const chatbot_num = `GCB-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    try {
        // Create the chatbot document
        const newChatbot = new Chatbot({
            account_num,
            chatbot_num,
            chatbot_name,
            status: 'idle', // Set default status to 'idle'
            preferences,
            access,
            track: { added: new Date(), modified: new Date() }
        });

        await newChatbot.save();
        res.status(200).json({
            "result": 200,
            "account": {
                "chatbot_id": "Object ID",
                "chatbot_num": chatbot_num,
                "chatbot_name": chatbot_name
            }

        });
    } catch (error) {
        res.status(400).json({ error: 'Error creating chatbot' });
    }
};
// get chatbot
export const getChatbot = async (req: Request, res: Response) => {
    const { chatbot_num } = req.params;

    try {
        // Find the chatbot by chatbot_num
        const chatbot = await Chatbot.findOne({ chatbot_num });

        if (!chatbot) {
            return res.status(404).json({
                result: 404,
                message: 'Chatbot not found'
            });
        }

        // Send chatbot information
        res.status(200).json({
            result: 200,
            chatbot: {
                chatbot_id: chatbot._id,
                cluster_num: chatbot.cluster_num,
                access_num: chatbot.access_num,
                account_num: chatbot.account_num,
                account_name: chatbot.account_name,
                chatbot_num: chatbot.chatbot_num,
                chatbot_name: chatbot.chatbot_name,
                status: chatbot.status,
                preferences: chatbot.preferences,
                topics: chatbot.topics,
                chat_db: chatbot.chat_db,
                ai_db: chatbot.vector_db,
                webhook: chatbot.webhook,
                track: chatbot.track
            }
        });
    } catch (error) {
        return res.status(200).json({
            "result": 404,
            "error": 1008,
            "msg": "Chatbot not found",
            "desc": "Specified Chatbot Number is invalid.",
            "data": {
                "chatbot_num": chatbot_num
            }
        });
    }
};
// search chatbots
export const searchChatbots = async (req: Request, res: Response) => {
    const { filter = {}, sort = {}, page = { length: 10, num: 1 } } = req.body;


    // Build filter query
    const query: any = {};

    // Apply filter conditions
    if (filter.account_num) {
        query.account_num = filter.account_num;
    }

    if (filter.chatbot_num) {
        query.chatbot_num = filter.chatbot_num;
    }

    if (filter.status) {
        query.status = filter.status;
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
    const sortOptions: any = {};
    for (const [key, value] of Object.entries(sort)) {
        sortOptions[key] = value; // Sorting by specified fields
    }

    try {
        // Query for total count of chatbots matching the filter
        const total = await Chatbot.countDocuments(query);

        // Query for filtered and paginated chatbots
        const chatbots = await Chatbot.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(pageLength);

        res.status(200).json({
            result: 200,
            page_length: pageLength,
            page_num: pageNum,
            total,
            chatbots
        });
    } catch (error) {
        res.status(500).json({
            result: 500,
            message: 'Error retrieving chatbots',
            error: ""
        });
    }
};
export const updateChatbotProfile = async (req: Request, res: Response) => {
    const { chatbot_num } = req.params;
    const updateFields = req.body;

    try {
        // Find chatbot by chatbot_num
        const chatbot = await Chatbot.findOne({ chatbot_num });

        if (!chatbot) {
            return res.status(404).json({
                result: 404,
                message: `Chatbot with number ${chatbot_num} not found`
            });
        }

        // Update only the fields that are provided
        if (updateFields.chatbot_name) {
            chatbot.chatbot_name = updateFields.chatbot_name;
        }

        if (updateFields.preferences) {
            chatbot.preferences = {
                ...chatbot.preferences,
                ...updateFields.preferences
            };
        }

        if (updateFields.access) {
            chatbot.access = {
                ...chatbot.access,
                ...updateFields.access
            };
        }

        // Update track.modified to current date
        chatbot.track.modified = new Date();

        // Save updated chatbot
        const updatedChatbot = await chatbot.save();

        res.status(200).json({
            result: 200,
            msg: `Chatbot profile for ${updatedChatbot.chatbot_name} is updated.`,
            data: {
                account_id: updatedChatbot.account_id,
                account_num: updatedChatbot.account_num,
                chatbot_id: updatedChatbot._id,
                chatbot_num: updatedChatbot.chatbot_num
            }
        });
    } catch (error) {
        return res.status(500).json({
            result: 500,
            "message": 'Error updating chatbot profile',
            "error": "error.message"
        });
    }
};
// update chatbot status
export const updateChatbotStatus = async (req: Request, res: Response) => {
    const { chatbot_num } = req.params;
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({
            result: 400,
            message: 'Status field is required'
        });
    }

    try {
        // Find chatbot by chatbot_num
        const chatbot = await Chatbot.findOne({ chatbot_num });

        if (!chatbot) {
            return res.status(404).json({
                result: 404,
                message: `Chatbot with number ${chatbot_num} not found`
            });
        }

        // Update status
        chatbot.status = status;

        // Update track fields based on the new status
        if (status === 'suspended') {
            chatbot.track.suspended = new Date();
        } else if (status === 'activated') {
            chatbot.track.activated = new Date();
        }

        // Save updated chatbot
        const updatedChatbot = await chatbot.save();

        res.status(200).json({
            result: 200,
            msg: `Chatbot ${updatedChatbot.chatbot_name} is ${updatedChatbot.status}.`,
            data: {
                account_id: updatedChatbot.account_id,
                account_num: updatedChatbot.account_num,
                chatbot_id: updatedChatbot._id,
                chatbot_num: updatedChatbot.chatbot_num,
                chatbot_name: updatedChatbot.chatbot_name,
                status: updatedChatbot.status
            }
        });
    } catch (error) {
        return res.status(500).json({
            result: 500,
            message: 'Error updating chatbot status',
            error: "error.message"
        });
    }
};
// update chatbot topic 
export const updateChatbotTopics = async (req: Request, res: Response) => {
    const { chatbot_num } = req.params;
    const topics = req.body;

    // Ensure topics is an array
    if (!Array.isArray(topics)) {
        return res.status(400).json({
            result: 400,
            message: 'Topics must be an array of strings'
        });
    }

    try {
        // Find chatbot by chatbot_num
        const chatbot = await Chatbot.findOne({ chatbot_num });

        if (!chatbot) {
            return res.status(404).json({
                result: 404,
                message: `Chatbot with number ${chatbot_num} not found`
            });
        }

        // Overwrite the topics array
        chatbot.topics = topics;

        // Update track.modified to current date
        chatbot.track.modified = new Date();

        // Save updated chatbot
        const updatedChatbot = await chatbot.save();

        res.status(200).json({
            result: 200,
            msg: `Topics updated for Chatbot ${updatedChatbot.chatbot_name}.`,
            data: {
                account_id: updatedChatbot.account_id,
                account_num: updatedChatbot.account_num,
                chatbot_id: updatedChatbot._id,
                chatbot_num: updatedChatbot.chatbot_num,
                chatbot_name: updatedChatbot.chatbot_name
            }
        });
    } catch (error) {
        return res.status(500).json({
            result: 500,
            message: 'Error updating chatbot topics',
            error: "message"
        });
    }
};
// Update chatbot chat_db by chatbot_num
export const updateChatbotChatDB = async (req: Request, res: Response) => {
    const { chatbot_num } = req.params;
    const { host, port, namespace, username, password } = req.body;

    // Ensure required fields are provided
    if (!host || !port || !namespace || !username || !password) {
        return res.status(400).json({
            result: 400,
            message: 'All chat_db fields (host, port, namespace, username, password) are required'
        });
    }

    try {
        // Find chatbot by chatbot_num
        const chatbot = await Chatbot.findOne({ chatbot_num });

        if (!chatbot) {
            return res.status(404).json({
                result: 404,
                message: `Chatbot with number ${chatbot_num} not found`
            });
        }

        // Update chat_db fields
        chatbot.chat_db = {
            host,
            port,
            namespace,
            username,
            password
        };

        // Update track.modified to current date
        chatbot.track.modified = new Date();

        // Save updated chatbot
        const updatedChatbot = await chatbot.save();

        res.status(200).json({
            result: 200,
            msg: `Chat Database information updated for Chatbot ${updatedChatbot.chatbot_name}.`,
            data: {
                account_id: updatedChatbot.account_id,
                account_num: updatedChatbot.account_num,
                chatbot_id: updatedChatbot._id,
                chatbot_num: updatedChatbot.chatbot_num,
                chatbot_name: updatedChatbot.chatbot_name
            }
        });
    } catch (error) {
        return res.status(500).json({
            result: 500,
            message: 'Error updating chatbot Chat-DB information',
            error: "error.message"
        });
    }
};
// Update chatbot vector_db by chatbot_num
export const updateChatbotVectorDB = async (req: Request, res: Response) => {
    const { chatbot_num } = req.params;
    const vectorDBUpdate = req.body;

    // Ensure the payload is not empty
    if (Object.keys(vectorDBUpdate).length === 0) {
        return res.status(400).json({
            result: 400,
            message: 'Payload cannot be an empty object'
        });
    }

    try {
        // Find chatbot by chatbot_num
        const chatbot = await Chatbot.findOne({ chatbot_num });

        if (!chatbot) {
            return res.status(404).json({
                result: 404,
                message: `Chatbot with number ${chatbot_num} not found`
            });
        }

        // Update only the provided vector_db fields
        chatbot.vector_db = {
            ...chatbot.vector_db,
            ...vectorDBUpdate
        };

        // Update track.modified to the current date
        chatbot.track.modified = new Date();

        // Save updated chatbot
        const updatedChatbot = await chatbot.save();

        res.status(200).json({
            result: 200,
            msg: `Vector Database information updated for Chatbot ${updatedChatbot.chatbot_name}.`,
            data: {
                account_id: updatedChatbot.account_id,
                account_num: updatedChatbot.account_num,
                chatbot_id: updatedChatbot._id,
                chatbot_num: updatedChatbot.chatbot_num,
                chatbot_name: updatedChatbot.chatbot_name
            }
        });
    } catch (error) {
        return res.status(500).json({
            result: 500,
            message: 'Error updating chatbot Vector-DB information',
            error: "error.message"
        });
    }
};


// Update chatbot webhook by chatbot_num
export const updateChatbotWebhook = async (req: Request, res: Response) => {
    const { chatbot_num } = req.params;
    const webhookUpdate = req.body;

    // Ensure the payload is not empty
    if (Object.keys(webhookUpdate).length === 0) {
        return res.status(400).json({
            result: 400,
            message: 'Payload cannot be an empty object'
        });
    }

    try {
        // Find chatbot by chatbot_num
        const chatbot = await Chatbot.findOne({ chatbot_num });

        if (!chatbot) {
            return res.status(404).json({
                result: 404,
                message: `Chatbot with number ${chatbot_num} not found`
            });
        }

        // Update only the provided webhook fields
        chatbot.webhook = {
            ...chatbot.webhook,
            ...webhookUpdate
        };

        // Update track.modified to the current date
        chatbot.track.modified = new Date();

        // Save updated chatbot
        const updatedChatbot = await chatbot.save();

        res.status(200).json({
            result: 200,
            msg: `Webhook information updated for Chatbot ${updatedChatbot.chatbot_name}.`,
            data: {
                account_id: updatedChatbot.account_id,
                account_num: updatedChatbot.account_num,
                chatbot_id: updatedChatbot._id,
                chatbot_num: updatedChatbot.chatbot_num,
                chatbot_name: updatedChatbot.chatbot_name
            }
        });
    } catch (error) {
        return res.status(500).json({
            result: 500,
            message: 'Error updating chatbot webhook information',
            error: "error.message"
        });
    }
};
