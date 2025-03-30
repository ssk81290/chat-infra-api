"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLandingPageModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const settingsSchema = new mongoose_1.Schema({
    sub_domain: { type: String, required: true, unique: true, index: true },
    domain: { type: String, required: true },
    fqdn: { type: String, required: true, unique: true, index: true },
    expiry: { type: Date },
    theme: { type: String, default: 'light' },
    cache_expiry: { type: Number, default: 120 }
}, { _id: false });
const menuSchema = new mongoose_1.Schema({
    whatsapp: {
        icon: { type: String, default: '', required: false },
        tooltip: { type: String, default: '', required: false },
        biz_phone: { type: String, default: '', required: false },
        url: { type: String, default: '', required: false },
    },
    call: {
        icon: { type: String, default: '', required: false },
        tooltip: { type: String, default: '', required: false },
        phone: { type: String, default: '', required: false },
        url: { type: String, default: '', required: false },
    },
    hamburger: [
        {
            text: { type: String, required: false },
            url: { type: String, required: false },
        },
    ],
}, { _id: false });
const landingPageSchema = new mongoose_1.Schema({
    account_id: { type: mongoose_1.Schema.Types.ObjectId, required: true, index: true },
    account_num: { type: String, required: true, index: true },
    account_name: { type: String, index: true },
    cluster_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Cluster",
        required: true,
    },
    cluster_num: { type: String, required: true },
    cluster_name: { type: String, required: true },
    flag: { type: String, required: true },
    chatbot_id: { type: mongoose_1.Schema.Types.ObjectId, index: true },
    chatbot_num: { type: String, index: true },
    title: { type: String, required: true, index: true },
    content: { type: String, default: '' },
    badge: { type: String, default: '' },
    meta_desc: { type: String, default: '' },
    keywords: { type: String, default: '' },
    track_code: { type: String, default: '' },
    menu: { type: menuSchema, required: false },
    settings: { type: settingsSchema, required: true },
    urls: [],
    check_urls: { type: Boolean, default: false },
    status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active', index: true },
    track: {
        created: { type: Date, default: Date.now },
        started: { type: Date },
        expired: { type: Date },
        suspended: { type: Date },
    },
}, { versionKey: false });
const createLandingPageModel = (connection) => {
    return connection.model('LandingPage', landingPageSchema, 'col_landing_pages');
};
exports.createLandingPageModel = createLandingPageModel;
