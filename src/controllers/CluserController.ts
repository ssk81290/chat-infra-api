import { Request, Response } from 'express';
import infraDBConnection from '../utils/infraDBConnection';
import {createCluster} from '../models/Cluster'; // ChatRoomVM model
// Get all database VMs with filtering and pagination

const cluster = createCluster(infraDBConnection)


export const getClusterList = async (req: Request, res: Response) => {
  const { page_length = 20, page_num = 1 } = req.query;

  try {
    // Build query object for filtering
    const query: any = {};
    // Pagination logic
    const limit = parseInt(page_length as string, 10) || 20;
    const page = parseInt(page_num as string, 10) || 1;
    const skip = (page - 1) * limit;

    // Count the total number of VMs matching the query
    const total = await cluster.countDocuments(query);

    // Fetch the VMs with pagination
    const clusters = await cluster.find(query)
      .skip(skip)
      .limit(limit);

    // Return the response with VM details
    return res.status(200).json({
      result: 200,
      page_length: limit,
      page_num: page,
      total,
      clusters: clusters.map(vm => ({
        cluster_id: vm._id,
        cluster_name: vm.cluster_name,
        cluster_num : vm.cluster_num,
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

