// src/controllers/chatbotController.ts
import { Request, Response } from "express";
import infraDBConnection from "../utils/infraDBConnection";
import { createChatbotModel } from "../models/chatbot"; // Chatbot model
import { createAccountModel } from "../models/account";
import { createAIModel } from "../models/aiModel";
import { createQueryProcessorModel } from "../models/queryProcessor";
import { createDBVMModel } from "../models/dbVM";
import { createCluster } from "../models/Cluster";

const Chatbot = createChatbotModel(infraDBConnection);
const Account = createAccountModel(infraDBConnection);
const aiModel = createAIModel(infraDBConnection);
const queryProcessor = createQueryProcessorModel(infraDBConnection);
const vmDbs = createDBVMModel(infraDBConnection);
const cluster = createCluster(infraDBConnection);

// Create a new chatbot
export const createChatbot = async (req: Request, res: Response) => {
  const {
    cluster_num,
    access_id,
    access_num,
    customer_id,
    account_num,
    chatbot_name,
    preferences = {},
    access,
    desc,
    mode
    
  } = req.body;

  
  // Generate a chatbot_num (random alphanumeric string, 10 characters)
  const chatbot_num = `GCB-${Math.random()
    .toString(36)
    .substring(2, 10)
    .toUpperCase()}`;

  const accountData = await Account.findOne({ account_num: account_num });
  if (!accountData) {
    return res.status(401).send("Invalid Account number provided");
  }
  const cluster_query: any = {};
  if(!cluster_num)
  { 
    cluster_query.cluster_num = accountData.cluster_num; 
  }
  else {
    cluster_query.cluster_num = accountData.cluster_num; 
  }

  const cluster_details = await cluster.findOne(cluster_query);
  
  const aiModelDetails = await aiModel.find({ default: true });
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
  const queryProcessorDetails = await queryProcessor.find({ default: true, mode: mode });
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
  const vmDetails = await vmDbs.findOne({ "default": true, status:"open" });
  if (vmDetails) {
    vector_db = {
      type: `${vmDetails.type}`,
      host: `${vmDetails.host}`,
      port: `${vmDetails.port}`,
      namespace: "bot1",
      collection: `bot_${
        chatbot_num
      }`,
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
      status: "active", // Set default status to 'idle'
      desc,
      preferences,
      vector_db: vector_db,
      access,
      track: { added: new Date(), modified: new Date() },
    });
    if(cluster_details)
    {
      newChatbot.cluster_id = cluster_details._id;
      newChatbot.cluster_name = cluster_details.cluster_name;
      newChatbot.flag = cluster_details.flag
    }

    let newChatbotData = await newChatbot.save();
    res.status(200).json({
      result: 200,
      account: {
        chatbot_id: newChatbotData._id,
        chatbot_num: chatbot_num,
        chatbot_name: chatbot_name,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: "Error creating chatbot" });
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
        message: "Chatbot not found",
      });
    }

    // Send chatbot information
    res.status(200).json({
      result: 200,
      chatbot: {
        chatbot_id: chatbot._id,
        landing_page_id: chatbot.landing_page_id,
        cluster_num: chatbot.cluster_num,
        cluster_name: chatbot.cluster_name,
        flag: chatbot.flag,
        desc: chatbot.desc,
        access_num: chatbot.access_num,
        account_num: chatbot.account_num,
        account_name: chatbot.account_name,
        chatbot_num: chatbot.chatbot_num,
        chatbot_name: chatbot.chatbot_name,
        status: chatbot.status,
        prompt : chatbot.prompt,
        preferences: chatbot.preferences,
        topics: chatbot.topics,
        chat_db: chatbot.chat_db,
        ai_db: chatbot.vector_db,
        webhook: chatbot.webhook,
        track: chatbot.track,
        mode : chatbot.mode
      },
    });
  } catch (error) {
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
  if (filter.cluster_num) {
    query.cluster_num = filter.cluster_num;
  }

  if (filter.chatbot_num) {
    query.chatbot_num = filter.chatbot_num;
  }

  if (filter.status) {
    query.status = filter.status;
  }
  if (filter?.chatbot_name && filter.chatbot_name !== "") {
    query.chatbot_name = {
      $regex: filter.chatbot_name,
      $options: 'i' // case-insensitive
    };
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
      message: "Error retrieving chatbots",
      error: "",
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
        message: `Chatbot with number ${chatbot_num} not found`,
      });
    }

    // Get existing chatbot first
    const existingChatbot = await Chatbot.findOne({ chatbot_num });

    if (!existingChatbot) {
        return res.status(404).json({
            result: 404,
            error: 'Chatbot not found',
            msg: 'Could not find chatbot with the specified chatbot_num'
        });
    }

    const existingPreferences = existingChatbot.preferences;

    // Merge the existing preferences with new values
    const updatedPreferences = {
        ...existingPreferences,
        bot: {
            ...existingPreferences.bot,
            ...updateFields.preferences.bot
        },
        theme: updateFields.preferences.theme
    };

    // Use the merged preferences in your update
    updateFields.preferences = updatedPreferences;

    // Update only the fields that are provided
    if (updateFields.chatbot_name) {
      chatbot.chatbot_name = updateFields.chatbot_name;
    }

    if (updateFields.preferences) {
      chatbot.preferences = {
        ...chatbot.preferences,
        ...updateFields.preferences,
      };
    }

    if (updateFields.access) {
      chatbot.access = {
        ...chatbot.access,
        ...updateFields.access,
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
        chatbot_num: updatedChatbot.chatbot_num,
      },
    });
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({
      result: 500,
      message: "Error updating chatbot profile",
      error: "error.message",
    });
  }
};
// update chatbot status
export const updateChatbotStatus = async (req: Request, res: Response) => {
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
    const chatbot = await Chatbot.findOne({ chatbot_num });

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
    } else if (status === "activated") {
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
        status: updatedChatbot.status,
      },
    });
  } catch (error) {
    return res.status(500).json({
      result: 500,
      message: "Error updating chatbot status",
      error: "error.message",
    });
  }
};
// update chatbot topic
export const updateChatbotTopics = async (req: Request, res: Response) => {
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
    const chatbot = await Chatbot.findOne({ chatbot_num });

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
    const updatedChatbot = await chatbot.save();

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
  } catch (error) {
    return res.status(500).json({
      result: 500,
      message: "Error updating chatbot topics",
      error: "message",
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
      message:
        "All chat_db fields (host, port, namespace, username, password) are required",
    });
  }

  try {
    // Find chatbot by chatbot_num
    const chatbot = await Chatbot.findOne({ chatbot_num });

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
    const updatedChatbot = await chatbot.save();

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
  } catch (error) {
    return res.status(500).json({
      result: 500,
      message: "Error updating chatbot Chat-DB information",
      error: "error.message",
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
      message: "Payload cannot be an empty object",
    });
  }

  try {
    // Find chatbot by chatbot_num
    const chatbot = await Chatbot.findOne({ chatbot_num });

    if (!chatbot) {
      return res.status(404).json({
        result: 404,
        message: `Chatbot with number ${chatbot_num} not found`,
      });
    }

    // Update only the provided vector_db fields
    chatbot.vector_db = {
      ...chatbot.vector_db,
      ...vectorDBUpdate,
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
        chatbot_name: updatedChatbot.chatbot_name,
      },
    });
  } catch (error) {
    return res.status(500).json({
      result: 500,
      message: "Error updating chatbot Vector-DB information",
      error: "error.message",
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
      message: "Payload cannot be an empty object",
    });
  }

  try {
    // Find chatbot by chatbot_num
    const chatbot = await Chatbot.findOne({ chatbot_num });

    if (!chatbot) {
      return res.status(404).json({
        result: 404,
        message: `Chatbot with number ${chatbot_num} not found`,
      });
    }

    // Update only the provided webhook fields
    chatbot.webhook = {
      ...chatbot.webhook,
      ...webhookUpdate,
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
        chatbot_name: updatedChatbot.chatbot_name,
      },
    });
  } catch (error) {
    return res.status(500).json({
      result: 500,
      message: "Error updating chatbot webhook information",
      error: "error.message",
    });
  }
};

export const updateChatbotAIModels = async (req: Request, res: Response) => {
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

    const Chatbot = createChatbotModel(infraDBConnection);

    // Find chatbot by chatbot_num
    const chatbot = await Chatbot.findOne({ chatbot_num });
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
      chatbot.preferences.embeddings = {
        ...chatbot.preferences.embeddings,
        ...embeddings,
      };
    }

    // Update query model information if provided
    if (query) {
      chatbot.preferences.query = {
        ...chatbot.preferences.query,
        ...query,
      };
    }

    // Update track.modified timestamp
    chatbot.track.modified = new Date();

    // Save the updated chatbot
    const updatedChatbot = await chatbot.save();

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
  } catch (error) {
    console.error('Error updating AI Models:', error);
    res.status(500).json({
      result: 500,
      error: 'Internal Server Error',
    });
  }
};

export const updateChatbotPrompt = async (req: Request, res: Response) => {
  const { chatbot_num } = req.params;
  const { persona, persona_object, instructions, collect, extra } = req.body;

  try {
    
    // if (!instructions || !collect || !extra) {
    //     return res.status(400).json({
    //         result: 400,
    //         error: 'Missing required fields',
    //         msg: 'instructions, collect, and extra are required'
    //     });
    // }
    
    // Then check that at least one of persona or persona_object exists
    // if (!persona && !persona_object) {
    //     return res.status(400).json({
    //         result: 400,
    //         error: 'Missing required fields',
    //         msg: 'Either persona or persona_object is required'
    //     });
    // }

    const Chatbot = createChatbotModel(infraDBConnection);

    // Find chatbot by chatbot_num
    const chatbot = await Chatbot.findOne({ chatbot_num });
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
    if (persona !== undefined) chatbot.prompt.persona = persona;
    if(persona_object !== undefined) chatbot.prompt.persona_obj = persona_object;
    if (instructions !== undefined) {
      chatbot.prompt.instructions = {
        ...chatbot.prompt.instructions,
        ...instructions,
      };
    }
    if (collect !== undefined) {
      chatbot.prompt.collect = {
        ...chatbot.prompt.collect,
        ...collect,
      };
    }
    if (extra !== undefined) {
      chatbot.prompt.extra = {
        ...chatbot.prompt.extra,
        ...extra,
      };
    }

    // Update track.modified timestamp
    chatbot.track.modified = new Date();

    // Save the updated chatbot
    const updatedChatbot = await chatbot.save();

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
  } catch (error) {
    console.error('Error updating Prompt:', error);
    res.status(500).json({
      result: 500,
      error: 'Internal Server Error',
    });
  }
};