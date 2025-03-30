import { Schema, Document, Model, Connection } from 'mongoose';

interface IQueryProcessor extends Document {
  processor: string;       // Unique name of the query processor
  description: string;     // Description of the query processor
  avatar: string;          // Default avatar for the processor
  command: string;         // Command to execute (e.g., tsx)
  path: string;            // Path to change directory before execution
  script: string;          // Script/service file path
  account_num?: string;    // Dedicated to a specific account (optional)
  chatbot_num?: string;    // Dedicated to a specific chatbot (optional)
  default: boolean;        // Indicates if this is the default processor
  mode : string;
}

const queryProcessorSchema: Schema = new Schema({
  processor: { type: String, required: true, unique: true, index: true },
  description: { type: String, required: true },
  avatar: { type: String, required: true },
  command: { type: String, required: true },
  path: { type: String, required: true },
  script: { type: String, required: true },
  account_num: { type: String, index: true },
  chatbot_num: { type: String, index: true },
  default: { type: Boolean, required: true, index: true },
  mode : { type : String, required : true}
}, { versionKey: false });

export const createQueryProcessorModel = (connection: Connection ) => {
  return connection.model<IQueryProcessor>('QueryProcessor', queryProcessorSchema, 'col_query_processors');
};
