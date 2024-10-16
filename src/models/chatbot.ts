// src/models/chatbot.ts
import mongoose, {Connection, Document, Schema } from 'mongoose';

// Interface for the Chatbot
interface IChatbot extends Document {
    cluster_id: mongoose.Types.ObjectId;
    cluster_num: string;
    access_id: mongoose.Types.ObjectId;
    access_num: string;
    account_id: mongoose.Types.ObjectId;
    account_num: string;
    account_name: string;
    chatbot_num: string;
    chatbot_name: string;
    status: string;
    preferences: {
        users: number;
        bots: number;
        agents: number;
        viewers: string;
        bot: {
            name: string;
            avatar: string;
        };
        theme: string;
        img_trigger: string;
        lifespan: number;
    };
    topics: string[];
    chat_db: {
        host: string;
        port: number;
        namespace: string;
        username: string;
        password: string;
    };
    vector_db: {
        host: string;
        port: number;
        namespace: string;
        username: string;
        password: string;
    };
    webhook: {
        url: string;
        auth: string;
        username: string;
        password: string;
        events: { [event: string]: boolean };
    };
    connectors: {
        [extn: string]: {
            name: string;
            actions: {
                [action: string]: {
                    label: string;
                    payload: Record<string, unknown>;
                };
            };
            cred: {
                username: string;
                password: string;
            };
        };
    };
    access: {
        web: {
            domains: string;
            strict: boolean;
        };
        apps: boolean;
    };
    track: {
        activated: Date;
        added: Date;
        modified: Date;
        suspended: Date;
    };
}

// Chatbot schema
const chatbotSchema: Schema = new mongoose.Schema({
    cluster_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Cluster', required: true },
    cluster_num: { type: String, required: true },
    access_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Auth', required: true },
    access_num: { type: String, required: true },
    account_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    account_num: { type: String, required: true, index: true },
    account_name: { type: String, required: true },
    chatbot_num: { type: String, required: true, unique: true, index: true },
    chatbot_name: { type: String, required: true },
    status: { type: String, required: true, index: true, default: 'idle' }, // Default to 'idle'
    preferences: {
        users: { type: Number, required: true },
        bots: { type: Number, required: true },
        agents: { type: Number, required: true },
        viewers: { type: String, required: true },
        bot: {
            name: { type: String, required: true },
            avatar: { type: String, required: true }
        },
        theme: { type: String, default: 'light' },
        img_trigger: { type: String, required: true },
        lifespan: { type: Number, default: 72 } // Default to 72 hours
    },
    topics: { type: [String], default: [] },
    chat_db: {
        host: { type: String, required: true },
        port: { type: Number, required: true },
        namespace: { type: String, required: true },
        username: { type: String, required: true },
        password: { type: String, required: true }
    },
    vector_db: {
        host: { type: String, required: true },
        port: { type: String, required: true },
        namespace: { type: String, required: true },
        username: { type: String, required: true },
        password: { type: String, required: true }
    },
    webhook: {
        url: { type: String, required: true },
        auth: { type: String, required: true },
        username: { type: String, required: true },
        password: { type: String, required: true },
        events: { type: Map, of: Boolean, required: true }
    },
    connectors: {
        type: Map,
        of: new mongoose.Schema({
            name: { type: String, required: true },
            actions: {
                type: Map,
                of: new mongoose.Schema({
                    label: { type: String, required: true },
                    payload: { type: Map, of: Schema.Types.Mixed, required: true }
                }),
                required: true
            },
            cred: {
                username: { type: String, required: true },
                password: { type: String, required: true }
            }
        })
    },
    access: {
        web: {
            domains: { type: String, required: true },
            strict: { type: Boolean, required: true }
        },
        apps: { type: Boolean, required: true }
    },
    track: {
        added: { type: Date, default: Date.now },
        modified: { type: Date, default: Date.now },
        suspended: { type: Date },
        activated: { type: Date }
    }
});


export const createChatbotModel = (connection: Connection) => {
    return connection.model<IChatbot>("Chatbot", chatbotSchema, 'col_chatbots');
};
  
