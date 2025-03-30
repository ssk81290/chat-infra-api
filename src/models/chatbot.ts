// src/models/chatbot.ts
import mongoose, { Connection, Document, Schema } from "mongoose";
import { types } from "util";

// Interface for the Chatbot
interface IChatbot extends Document {
  cluster_id: mongoose.Types.ObjectId;
  cluster_num: string;
  cluster_name : string;
  flag : string;
  access_id: mongoose.Types.ObjectId;
  access_num: string;
  account_id: mongoose.Types.ObjectId;
  account_num: string;
  account_name: string;
  chatbot_num: string;
  chatbot_name: string;
  status: string;
  mode : string;
  preferences: {
    users: number;
    bots: number;
    agents: number;
    viewers: string;
    bot: {
      name: string;
      avatar: string;
      script: string;
      path: string;
      processor: string;
    };
    theme: string;
    img_trigger: string;
    lifespan: number;
    embeddings: {};
    query: {};
    welcome: string;
  };
  topics: string[];
  auto_topics: {
    generate: boolean;
    interval: number;
  };

  auto_genrate_topics: boolean;
  topic_ganeration_time: number;
  chat_db: {
    host: string;
    port: number;
    namespace: string;
    username: string;
    password: string;
  };
  vector_db: {};
  prompt: {
    persona: string;
    persona_obj : {};
    instructions: {};
    collect: {};
    extra: {};
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
const chatbotSchema: Schema = new mongoose.Schema(
  {
    cluster_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cluster",
      required: false,
    },
    cluster_num: { type: String, required: false },
    cluster_name : { type: String, required: false },
    flag : { type: String, required: false },
    access_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      required: false,
    },
    access_num: { type: String, required: false },
    account_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: false,
    },
    account_num: { type: String, required: false, index: false },
    account_name: { type: String, required: false },
    chatbot_num: { type: String, required: false, unique: false, index: false },
    chatbot_name: { type: String, required: false },
    status: { type: String, required: false, index: false, default: "active" }, // Default to 'idle'
    mode: { type: String, required: false, index: false }, // Default to 'idle'
    preferences: {
      users: { type: Number, required: false },
      bots: { type: Number, required: false },
      agents: { type: Number, required: false },
      viewers: { type: String, required: false },
      bot: {
        name: { type: String, required: false },
        avatar: { type: String, required: false },
        processor: { type: String, required: false },
        script: { type: String, required: false },
        path: { type: String, required: false },
      },
      theme: { type: String, default: "light" },
      img_trigger: { type: String, required: false },
      lifespan: { type: Number, default: 72 }, // Default to 72 hours
      embeddings: { type: Object, default: {} },
      query: { type: Object, default: {} },
      welcome: { type: String, required: false },
    },
    topics: { type: [String], default: [] },
    auto_topics: {
      generate: { type: Boolean, default: false },
      interval: { type: Number, default: false },
    },
    chat_db: {
      host: { type: String, required: false },
      port: { type: Number, required: false },
      namespace: { type: String, required: false },
      username: { type: String, required: false },
      password: { type: String, required: false },
    },
    vector_db: { type: Object, required: false },
    prompt: {
      persona: { type: String, required: false },
      persona_obj : {type : Object, required : false},
      instructions: { type: Object, required: false },
      collect: { type: Object, required: false },
      extra: { type: Object, required: false },
    },
    webhook: {
      url: { type: String, required: false },
      auth: { type: String, required: false },
      username: { type: String, required: false },
      password: { type: String, required: false },
      events: { type: Map, of: Boolean, required: false },
    },
    connectors: {
      type: Map,
      of: new mongoose.Schema({
        name: { type: String, required: false },
        actions: {
          type: Map,
          of: new mongoose.Schema({
            label: { type: String, required: false },
            payload: { type: Map, of: Schema.Types.Mixed, required: false },
          }),
          required: false,
        },
        cred: {
          username: { type: String, required: false },
          password: { type: String, required: false },
        },
      }),
    },
    access: {
      web: {
        domains: { type: String, required: false },
        strict: { type: Boolean, required: false },
      },
      apps: { type: Boolean, required: false },
    },
    track: {
      added: { type: Date, default: Date.now },
      modified: { type: Date, default: Date.now },
      suspended: { type: Date },
      activated: { type: Date },
    },
  },
  { versionKey: false }
);

export const createChatbotModel = (connection: Connection) => {
  return connection.model<IChatbot>("Chatbot", chatbotSchema, "col_chatbots");
};
