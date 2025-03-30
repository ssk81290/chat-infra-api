import { Request, Response } from 'express';
import infraDBConnection from '../utils/infraDBConnection';
import { createChatbotModel } from '../models/chatbot';   // Chatbot model
import { createTaskModel } from '../models/task';
import { createTaskGroupModel } from '../models/taskGroup';
import { publishToQueue } from '../utils/rabbitMQ'; 
import { validateURL, validateXMLFile } from '../utils/urlValidator'; 
import { connectToDatabase } from '../utils/dbValidator'; 
import moment from 'moment';

import dotenv from 'dotenv';
import fs from "fs";
import mime  from 'mime-types';
import path from "path";

dotenv.config();
const Task = createTaskModel(infraDBConnection);
const TaskGroup = createTaskGroupModel(infraDBConnection);
const chatbot = createChatbotModel(infraDBConnection);


const TASK_TYPES = ['file', 'url', 'db'];

const GROUP_TASK_TYPES = ['website', 'sitemap'];

// Controller Function
export const createIngestionTask = async (req: Request, res: Response) => {
  const chatbot_id = req.params.chatbot_id;
  const { type, url, file, db, parent } = req.body;

  try {

    const chatbotDetails = await chatbot.findOne({chatbot_num:chatbot_id}); // Assuming Chatbot model exists
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
      if (!url?.url || !validateURL(url.url)) {
        return res.status(400).json({ result: 400, error: 'Invalid or inaccessible URL' });
      }
      loader = 'url_loader'; // Set appropriate loader
    }

    if (type === 'db') {
      const connectionSuccess = await connectToDatabase(db);
      if (!connectionSuccess) {
        return res.status(400).json({ result: 400, error: 'Database connection failed' });
      }
      loader = 'db_loader';
    }

    if (type === 'file') {
      loader = 'file_loader';
      fs.stat(file.file, (err, stats) => {
        if (err) {
          return res.status(400).json({ result: 400, error: 'File not accessible' });
        }
        req.body[type].name = path.basename(file.file);
        req.body[type].size = stats.size;
        console.log(`Filename: ${path.basename(file.file)}`);
        console.log(`File size: ${stats.size} bytes`);
        console.log(`Mime: ${mime.lookup(file.file)}`)
    });

    }

    const taskData = {
      
      chatbot_id: chatbotDetails._id.toString(),
      account_id: chatbotDetails.account_id, // Retrieve this dynamically
      account_num: chatbotDetails.account_num, // Retrieve this dynamically
      chatbot_num: chatbotDetails.chatbot_num, // Retrieve this dynamically
      type,
      [type]: req.body[type], // Dynamic field based on type
      status: 'queued',
      count: { embedding: 0 },
      track: {
        added: moment().toISOString(),
        queued: moment().toISOString(),
      },
    };

    const task = await createTaskModel(infraDBConnection).create(taskData);

    // Post Task to RabbitMQ
    await publishToQueue('enterprise_data_loading', {
      task_id: task._id,
      chatbot_id,
      operation:'loader',
      loader,
      type,
    });

    res.status(200).json({ result: 200, task_id: task._id });
  } catch (error) {
    console.error('Error creating ingestion task:', error);
    res.status(500).json({ result: 500, error: 'Internal server error' });
  }
};

export const createTaskGroup = async (req: Request, res: Response) => {
  const chatbot_id = req.params.chatbot_id;
  const { type, job_title, url, pre_process } = req.body;

  let website_url = url;
  try {
    // Validate Task Type
    if (!GROUP_TASK_TYPES.includes(type)) {
      return res.status(400).json({ result: 400, error: 'Invalid task type' });
    }

    // Validate Chatbot Ownership (example check)
    const chatbotDetails = await chatbot.findOne({chatbot_num:chatbot_id}); // Assuming Chatbot model exists
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
      chatbot_id:chatbotDetails._id,
      job_title : "importer",
      chatbot_num: chatbot_id,
      type,
      url : website_url,
      pre_process: pre_process || {},
      status: 'pending',
      count: {
        url_read: 0,
        done: 0,
        failed: 0,
      },
      track: {
        added: moment().toISOString(),
      },
    };

    
    const taskGroup = await TaskGroup.create(taskGroupData);

    // Post to RabbitMQ
    await publishToQueue('enterprise_data_loading', {
      task_id: taskGroup._id,
      chatbot_id: taskGroupData.chatbot_id,
      operation:'importer',
      type,
      website_url,
    });

    // Send Response
    res.status(200).json({ result: 200, task_group_id: taskGroup._id });
  } catch (error) {
    console.error('Error creating task group:', error);
    res.status(500).json({ result: 500, error: error });
  }
};
const getPagination = (req: Request) => {
  const pageNum = parseInt(req.query.page_num as string) || 1;
  const pageLength = parseInt(req.query.page_length as string) || 20;
  return { skip: (pageNum - 1) * pageLength, limit: pageLength, pageNum, pageLength };
};

/**
 * Get Task Groups with optional filters
 */
export const getTaskGroups = async (req: Request, res: Response) => {
  try {
    const { type, task_group_id, account_id, chatbot_id, account_num, chatbot_num, status } = req.query;
    const { skip, limit, pageNum, pageLength } = getPagination(req);

    // Construct filter query
    const filter: any = {};
    if (type) filter.type = type;
    if (task_group_id) filter._id = task_group_id;
    if (account_id) filter.account_id = account_id;
    if (account_num) filter.account_num = account_num;
    if (chatbot_id) filter.chatbot_num = chatbot_num;

    if (status) filter.status = status;

    // Fetch data
    const total = await TaskGroup.countDocuments(filter);
    const taskGroups = await TaskGroup.find(filter).skip(skip).limit(limit);

    return res.json({
      result: 200,
      page_length: pageLength,
      page_num: pageNum,
      total,
      task_groups: taskGroups,
    });
  } catch (error) {
    return res.status(500).json({ result: 500, error: "Internal Server Error" });
  }
};

/**
 * Get Individual Tasks with optional filters
 */
export const getTasks = async (req: Request, res: Response) => {
  try {
    const { type, task_id, task_group_id, account_id, chatbot_id, account_num, chatbot_num, status } = req.query;
    const { skip, limit, pageNum, pageLength } = getPagination(req);

    // Construct filter query
    const filter: any = {};
    if (type) filter.type = type;
    if (task_id) filter._id = task_id;
    if (task_group_id) filter["parent.task_group_id"] = task_group_id || { $exists: false };
    if (account_id) filter.account_id = account_id;
    if (account_num) filter.account_num = account_num;
    if (chatbot_id) filter.chatbot_num = chatbot_num;
    //if (chatbot_num) filter.chatbot_num = chatbot_num;
    if (status) filter.status = status;

    // Fetch data
    const total = await Task.countDocuments(filter);
    const tasks = await Task.find(filter).skip(skip).limit(limit);

    return res.json({
      result: 200,
      page_length: pageLength,
      page_num: pageNum,
      total,
      tasks,
    });
  } catch (error) {
    return res.status(500).json({ result: 500, error: "Internal Server Error" });
  }
};