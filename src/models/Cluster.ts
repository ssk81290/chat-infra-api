import mongoose, { Schema, Document, Connection } from "mongoose";

export interface ICluster extends Document {
  cluster_num: string;
  cluster_name: string;
  flag : string;
  status: "active" | "inactive" | "suspended"; // Enum values for status
  track: {
    added: Date;
  };
}

const ClusterSchema: Schema = new Schema(
  {
    cluster_num: { type: String, required: true, unique: true, index: true },
    cluster_name: { type: String, required: true },
    flag : {type : String, required : true},
    status: {
      type: String,
      required: true,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    track: {
      added: { type: Date, default: Date.now },
    },
  },
  { versionKey: false, timestamps: false }
);


export const createCluster = (connection: Connection) => {
  return connection.model<ICluster>("Cluster", ClusterSchema, 'col_clusters');

};