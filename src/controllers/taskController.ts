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

  try {
    // Validate Task Type
    if (!TASK_TYPES.includes(type)) {
      return res.status(400).json({ result: 400, error: 'Invalid task type' });
    }

    // Validate Chatbot Ownership (example check)
    const chatbotDetails = await chatbot.findOne({chatbot_num:chatbot_id}); // Assuming Chatbot model exists
    if (!chatbotDetails) {
      return res.status(404).json({ result: 404, error: 'Chatbot not found' });
    }

    // Validate URL
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return res.status(400).json({ result: 400, error: 'Invalid URL format. URL must start with http or https.' });
    }

    const isURLAccessible = await validateURL(url);
    if (!isURLAccessible) {
      return res.status(400).json({ result: 400, error: 'URL is not accessible or does not return HTTP 200.' });
    }

    // Additional validation for type=sitemap
    if (type === 'sitemap' && !validateXMLFile(url)) {
      return res.status(400).json({ result: 400, error: 'Invalid Sitemap. URL must point to a valid XML file.' });
    }

    // Create Task Group Data
    const taskGroupData = {
      account_id: chatbotDetails.account_id,
      account_num: chatbotDetails.account_num,
     
      chatbot_num: chatbot_id,
      type,
      job_title,
      url,
      pre_process: pre_process || {},
      status: 'url-read',
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
      task_group_id: taskGroup._id,
      chatbot_id,
      operation:'importer',
      type,
      url,
    });

    // Send Response
    res.status(200).json({ result: 200, task_group_id: taskGroup._id });
  } catch (error) {
    console.error('Error creating task group:', error);
    res.status(500).json({ result: 500, error: 'Internal server error' });
  }
};
