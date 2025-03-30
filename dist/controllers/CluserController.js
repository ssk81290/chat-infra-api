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
exports.getClusterList = void 0;
const infraDBConnection_1 = __importDefault(require("../utils/infraDBConnection"));
const Cluster_1 = require("../models/Cluster"); // ChatRoomVM model
// Get all database VMs with filtering and pagination
const cluster = (0, Cluster_1.createCluster)(infraDBConnection_1.default);
const getClusterList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { page_length = 20, page_num = 1 } = req.query;
    try {
        // Build query object for filtering
        const query = {};
        // Pagination logic
        const limit = parseInt(page_length, 10) || 20;
        const page = parseInt(page_num, 10) || 1;
        const skip = (page - 1) * limit;
        // Count the total number of VMs matching the query
        const total = yield cluster.countDocuments(query);
        // Fetch the VMs with pagination
        const clusters = yield cluster.find(query)
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
                cluster_num: vm.cluster_num,
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
exports.getClusterList = getClusterList;
