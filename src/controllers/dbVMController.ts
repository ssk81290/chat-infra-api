import { Request, Response } from 'express';
import {createDBVMModel} from '../models/dbVM'; // Database VM model
import infraDBConnection from '../utils/infraDBConnection';
import {createChatRoomVMModel} from '../models/chatRoomVM'; // ChatRoomVM model
// Get all database VMs with filtering and pagination

const DBVM = createDBVMModel(infraDBConnection)
const ChatRoomVM = createChatRoomVMModel(infraDBConnection);

export const getAllDbVMs = async (req: Request, res: Response) => {
  const { cluster_id, zone, host, domain } = req.query;
  const { page_length = 20, page_num = 1 } = req.query;

  try {
    // Build query object for filtering
    const query: any = {};

    if (cluster_id) query.cluster_id = cluster_id;
    if (zone) query.zone = zone;
    if (host) query.host = host;
    if (domain) query.domain = domain;

    // Pagination logic
    const limit = parseInt(page_length as string, 10) || 20;
    const page = parseInt(page_num as string, 10) || 1;
    const skip = (page - 1) * limit;

    // Count the total number of VMs matching the query
    const total = await DBVM.countDocuments(query);

    // Fetch the VMs with pagination
    const dbVms = await DBVM.find(query)
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
  } catch (error) {
    return res.status(500).json({
      result: 500,
      message: 'Error retrieving database VMs',
      error: "error.message"
    });
  }
};




// Get all chatroom VMs with filtering and pagination
export const getAllChatroomVMs = async (req: Request, res: Response) => {
  const { cluster_id, zone, host, domain, count_chatrooms } = req.query;
  const { page_length = 20, page_num = 1 } = req.query;

  try {
    // Build query object for filtering
    const query: any = {};

    if (cluster_id) query.cluster_id = cluster_id;
    if (zone) query.zone = zone;
    if (host) query.host = host;
    if (domain) query.domain = domain;

    // Filter for free VMs where count_chatrooms is 0
    if (count_chatrooms === '0') query.count_chatrooms = 0;

    // Pagination logic
    const limit = parseInt(page_length as string, 10) || 20;
    const page = parseInt(page_num as string, 10) || 1;
    const skip = (page - 1) * limit;

    // Count the total number of VMs matching the query
    const total = await ChatRoomVM.countDocuments(query);

    // Fetch the VMs with pagination
    const chatroomVms = await ChatRoomVM.find(query)
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
  } catch (error) {
    return res.status(500).json({
      result: 500,
      message: 'Error retrieving chatroom VMs',
      error: "error.message"
    });
  }
};
