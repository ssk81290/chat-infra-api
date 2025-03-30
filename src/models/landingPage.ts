import mongoose, { Schema, Document, Model, Connection } from 'mongoose';

interface ISettings {
    sub_domain: string;       // Sub-domain name
    domain: string;           // Domain name
    fqdn: string;             // Fully qualified domain name
    expiry?: Date;            // Optional expiry date
    theme: string;            // Theme for the landing page
    cache_expiry:number;
  }
  interface IMenu {
    whatsapp?: {
      icon?: string;
      tooltip?: string;
      biz_phone?: string;
      url?: string;
    };
    call?: {
      icon?: string;
      tooltip?: string;
      phone?: string;
      url?: string;
    };
    hamburger?: Array<{
      text: string;
      url: string;
    }>;
  }

  interface ILandingPage extends Document {
    account_id: string;       // Reference to account
    account_num: string;      // Account number
    account_name: string;     // Account name
    cluster_id: mongoose.Types.ObjectId;
    cluster_num: string;
    cluster_name : string;
    flag : string;
    chatbot_id: string;       // Reference to chatbot
    chatbot_num: string;      // Chatbot number
  
    title: string;            // Page title
    content: string;          // Initial content of the landing page
    badge: string;            // Badge for the page
    meta_desc: string;        // Meta description for SEO
    keywords: string;        // Comma-separated keywords for SEO
    track_code: string;       // Tracking code (e.g., Google Analytics)
    menu: IMenu; 
    settings: ISettings;      // Page settings
    urls : [];
    check_urls : boolean;
    status: string;           // Landing page status
    track: {
      created: Date;
      started?: Date;
      expired?: Date;
      suspended?: Date;
    };
  }
  
  const settingsSchema: Schema = new Schema({
    sub_domain: { type: String, required: true, unique: true, index: true },
    domain: { type: String, required: true },
    fqdn: { type: String, required: true, unique: true, index: true },
    expiry: { type: Date },
    theme: { type: String, default: 'light' }, // Default theme
    cache_expiry : {type:Number, default:120}
  }, { _id: false });

  const menuSchema: Schema = new Schema({
    whatsapp: {
      icon: { type: String, default: '', required : false },
      tooltip: { type: String, default: '', required : false },
      biz_phone: { type: String, default: '', required : false },
      url: { type: String, default: '', required : false },
    },
    call: {
      icon: { type: String, default: '', required : false },
      tooltip: { type: String, default: '', required : false },
      phone: { type: String, default: '', required : false },
      url: { type: String, default: '', required : false },
    },
    hamburger: [
      {
        text: { type: String, required: false },
        url: { type: String, required: false },
      },
    ],
  }, { _id: false });

  const landingPageSchema: Schema = new Schema({
    account_id: { type: Schema.Types.ObjectId, required: true, index: true },
    account_num: { type: String, required: true, index: true },
    account_name: { type: String, index: true },
    cluster_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cluster",
        required: true,
      },
      cluster_num: { type: String, required: true },
      cluster_name : { type: String, required: true },
      flag : { type: String, required: true },
    chatbot_id: { type: Schema.Types.ObjectId, index: true },
    chatbot_num: { type: String, index: true },
  
    title: { type: String, required: true, index: true },
    content: { type: String, default: '' },
    badge: { type: String, default: '' },
    meta_desc: { type: String, default: '' },
    keywords: { type: String, default: '' },
    track_code: { type: String, default: '' },
    menu: { type: menuSchema, required: false },
    settings: { type: settingsSchema, required: true },
    urls : [],
    check_urls : {type : Boolean, default : false},
  
    status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active', index: true },
  
    track: {
      created: { type: Date, default: Date.now },
      started: { type: Date },
      expired: { type: Date },
      suspended: { type: Date },
    },
  }, { versionKey: false });

export const createLandingPageModel = (connection: Connection) => {
  return connection.model<ILandingPage>('LandingPage', landingPageSchema, 'col_landing_pages');
};
