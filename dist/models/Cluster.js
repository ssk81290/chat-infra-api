"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCluster = void 0;
const mongoose_1 = require("mongoose");
const ClusterSchema = new mongoose_1.Schema({
    cluster_num: { type: String, required: true, unique: true, index: true },
    cluster_name: { type: String, required: true },
    flag: { type: String, required: true },
    status: {
        type: String,
        required: true,
        enum: ["active", "inactive", "suspended"],
        default: "active",
    },
    track: {
        added: { type: Date, default: Date.now },
    },
}, { versionKey: false, timestamps: false });
const createCluster = (connection) => {
    return connection.model("Cluster", ClusterSchema, 'col_clusters');
};
exports.createCluster = createCluster;
