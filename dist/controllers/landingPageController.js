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
exports.updateLandingPageChatbot = exports.updateLandingPageStatus = exports.updateLandingPage = exports.searchLandingPages = exports.getLandingPage = exports.createLandingPage = void 0;
const landingPage_1 = require("../models/landingPage"); // Landing page model
const account_1 = require("../models/account");
const Cluster_1 = require("../models/Cluster");
const infraDBConnection_1 = __importDefault(require("../utils/infraDBConnection")); // InfraDB connection
const moment_1 = __importDefault(require("moment"));
const slugify_1 = __importDefault(require("slugify"));
const account = (0, account_1.createAccountModel)(infraDBConnection_1.default);
const cluster = (0, Cluster_1.createCluster)(infraDBConnection_1.default);
// Controller Function
const createLandingPage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { cluster_num, account_num, title, content, badge, meta_desc, keywords, track_code, settings, check_urls, menu } = req.body;
    try {
        // Validate required fields
        if (!account_num || !title || !(settings === null || settings === void 0 ? void 0 : settings.sub_domain)) {
            return res.status(400).json({ result: 400, error: 'Missing required fields' });
        }
        const accountDetails = yield account.findOne({ account_num: account_num });
        if (!accountDetails) {
            return res.status(400).json({ result: 400, error: 'Invalid account number' });
        }
        const cluster_query = {};
        if (!cluster_num) {
            cluster_query.cluster_num = accountDetails.cluster_num;
        }
        else {
            cluster_query.cluster_num = accountDetails.cluster_num;
        }
        const cluster_details = yield cluster.findOne(cluster_query);
        const account_id = accountDetails._id.toString();
        // Default values for optional fields
        const landingPageData = {
            account_num,
            account_id,
            cluster_id: cluster_details === null || cluster_details === void 0 ? void 0 : cluster_details._id,
            cluster_name: cluster_details === null || cluster_details === void 0 ? void 0 : cluster_details.cluster_name,
            cluster_num: cluster_details === null || cluster_details === void 0 ? void 0 : cluster_details.cluster_num,
            flag: cluster_details === null || cluster_details === void 0 ? void 0 : cluster_details.flag,
            title,
            content: content || '',
            badge: badge || '',
            meta_desc: meta_desc || '',
            keywords: keywords || '',
            track_code: track_code || '',
            check_urls: check_urls,
            urls: [],
            menu: menu,
            settings: {
                sub_domain: settings.sub_domain,
                domain: settings.domain || 'qwickpages.ai',
                fqdn: `${settings.sub_domain}.${settings.domain}`,
                expiry: settings.expiry ? (0, moment_1.default)(settings.expiry, 'YYYY-MM-DD').toDate() : null,
                theme: settings.theme || 'light'
            },
            track: {
                created: (0, moment_1.default)().toISOString(),
            },
        };
        const fqdn = ((_a = landingPageData.settings) === null || _a === void 0 ? void 0 : _a.fqdn) || '';
        const keywordss = ((_b = landingPageData.keywords) === null || _b === void 0 ? void 0 : _b.split(',').map((kwd) => kwd.trim())) || [];
        const urls = keywordss.map((keyword) => `https://${fqdn}/${(0, slugify_1.default)(keyword, "-")}`);
        urls.push(`https://${fqdn}`);
        landingPageData.urls = urls;
        const LandingPage = (0, landingPage_1.createLandingPageModel)(infraDBConnection_1.default);
        // Create the landing page document
        const newLandingPage = yield LandingPage.create(landingPageData);
        // Send response
        res.status(200).json({
            result: 200,
            landing_page: {
                landing_page_id: newLandingPage._id,
                title: newLandingPage.title,
                urls: urls
            },
        });
    }
    catch (error) {
        console.error('Error creating landing page:', error);
        res.status(500).json({ result: 500, error: 'Internal server error' });
    }
});
exports.createLandingPage = createLandingPage;
const getLandingPage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { landing_page_id } = req.params;
    try {
        // Connect to the Landing Page model
        const LandingPage = (0, landingPage_1.createLandingPageModel)(infraDBConnection_1.default);
        // Find the Landing Page by ID
        const landingPage = yield LandingPage.findById(landing_page_id);
        if (!landingPage) {
            return res.status(404).json({
                result: 404,
                error: 2008,
                msg: 'Landing Page not found',
                desc: 'Specified Landing Page is invalid.',
                data: {
                    landing_page_id,
                },
            });
        }
        // Build the response object
        const response = {
            result: 200,
            landing_page: {
                landing_page_id: landingPage._id,
                account_id: landingPage.account_id,
                account_num: landingPage.account_num,
                account_name: landingPage.account_name,
                chatbot_id: landingPage.chatbot_id,
                chatbot_num: landingPage.chatbot_num,
                cluster_name: landingPage.cluster_name,
                cluster_num: landingPage.cluster_num,
                flag: landingPage.flag,
                title: landingPage.title,
                content: landingPage.content,
                badge: landingPage.badge,
                meta_desc: landingPage.meta_desc,
                keywords: landingPage.keywords,
                track_code: landingPage.track_code,
                urls: landingPage.urls,
                check_urls: landingPage.check_urls,
                settings: {
                    sub_domain: landingPage.settings.sub_domain,
                    domain: landingPage.settings.domain,
                    fqdn: `${landingPage.settings.sub_domain}.${landingPage.settings.domain}`,
                    expiry: landingPage.settings.expiry,
                    theme: landingPage.settings.theme,
                    cache_expiry: landingPage.settings.cache_expiry
                },
                menu: landingPage.menu,
                status: landingPage.status,
                track: landingPage.track,
            },
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error retrieving landing page:', error);
        res.status(500).json({ result: 500, error: 'Internal server error' });
    }
});
exports.getLandingPage = getLandingPage;
const searchLandingPages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { filter, sort, page } = req.body;
    try {
        const LandingPage = (0, landingPage_1.createLandingPageModel)(infraDBConnection_1.default);
        // Build filter query
        const query = {};
        if (filter === null || filter === void 0 ? void 0 : filter.account_num)
            query.account_num = filter.account_num;
        if (filter === null || filter === void 0 ? void 0 : filter.chatbot_num)
            query.chatbot_num = filter.chatbot_num;
        if (filter === null || filter === void 0 ? void 0 : filter.cluster_num)
            query.cluster_num = filter.cluster_num;
        if (filter === null || filter === void 0 ? void 0 : filter.status)
            query.status = filter.status;
        if (filter === null || filter === void 0 ? void 0 : filter.fqdn)
            query.settings.fqdn = filter.fqdn;
        if (filter === null || filter === void 0 ? void 0 : filter.add_date) {
            query['track.created'] = {
                $gte: (0, moment_1.default)(filter.add_date.from).toDate(),
                $lte: (0, moment_1.default)(filter.add_date.to).toDate(),
            };
        }
        if (filter === null || filter === void 0 ? void 0 : filter.suspend_date) {
            query['track.suspended'] = {
                $gte: (0, moment_1.default)(filter.suspend_date.from).toDate(),
                $lte: (0, moment_1.default)(filter.suspend_date.to).toDate(),
            };
        }
        if (filter === null || filter === void 0 ? void 0 : filter.expiry_date) {
            query['settings.expiry'] = {
                $gte: (0, moment_1.default)(filter.expiry_date.from).toDate(),
                $lte: (0, moment_1.default)(filter.expiry_date.to).toDate(),
            };
        }
        // Pagination and Sorting
        const sortQuery = sort || { title: 1 };
        const pageLength = (page === null || page === void 0 ? void 0 : page.length) || 20;
        const pageNum = (page === null || page === void 0 ? void 0 : page.num) || 1;
        //console.log(query);
        const [landingPages, total] = yield Promise.all([
            LandingPage.find(query)
                .sort(sortQuery)
                .skip((pageNum - 1) * pageLength)
                .limit(pageLength),
            LandingPage.countDocuments(query),
        ]);
        // console.log(landingPages);
        //   const landingPagesWithUrls = landingPages.map((page) => {
        //   const fqdn = page.settings?.fqdn || '';
        //   const keywords = page.keywords?.split(',').map((kw) => kw.trim()) || [];
        //   const urls = keywords.map((keyword) => `https://${fqdn}/${slugify(keyword,"-")}`);
        //   urls.push( `https://${fqdn}`);
        //   return {
        //     ...page.toObject(),
        //     urls,
        //   };
        // });
        res.status(200).json({
            result: 200,
            page_length: pageLength,
            page_num: pageNum,
            total,
            landing_pages: landingPages,
        });
    }
    catch (error) {
        console.error('Error searching landing pages:', error);
        res.status(500).json({ result: 500, error: 'Internal server error' });
    }
});
exports.searchLandingPages = searchLandingPages;
const updateLandingPage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return res.status(200).json({ result: 500, error: 'Internal server error' });
    const { landing_page_id } = req.params;
    const updates = req.body;
    try {
        const LandingPage = (0, landingPage_1.createLandingPageModel)(infraDBConnection_1.default);
        updates['track.modified'] = (0, moment_1.default)().toISOString();
        const updatedLandingPage = yield LandingPage.findByIdAndUpdate(landing_page_id, updates, { new: true });
        if (!updatedLandingPage) {
            return res.status(404).json({
                result: 404,
                error: 2008,
                msg: 'Landing Page not found',
                desc: 'Specified Landing Page is invalid.',
                data: { landing_page_id },
            });
        }
        // const fqdn = updatedLandingPage.settings?.fqdn || '';
        // const keywordss = updatedLandingPage.keywords?.split(',').map((kwd) => kwd.trim()) || [];
        // const urls = keywordss.map((keyword) => `https://${fqdn}/${slugify(keyword,"-")}`);
        // urls.push( `https://${fqdn}`);
        res.status(200).json({
            result: 200,
            msg: `Landing Page ${updatedLandingPage.title} is updated.`,
            data: {
                account_id: updatedLandingPage.account_id,
                account_num: updatedLandingPage.account_num,
                title: updatedLandingPage.title,
                urls: updatedLandingPage.urls
            },
        });
    }
    catch (error) {
        console.error('Error updating landing page:', error);
        res.status(500).json({ result: 500, error: 'Internal server error' });
    }
});
exports.updateLandingPage = updateLandingPage;
const updateLandingPageStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { landing_page_id } = req.params;
    const { status } = req.body;
    try {
        const LandingPage = (0, landingPage_1.createLandingPageModel)(infraDBConnection_1.default);
        const updatedLandingPage = yield LandingPage.findByIdAndUpdate(landing_page_id, { status, 'track.modified': (0, moment_1.default)().toISOString() }, { new: true });
        if (!updatedLandingPage) {
            return res.status(404).json({
                result: 404,
                error: 2008,
                msg: 'Landing Page not found',
                desc: 'Specified Landing Page is invalid.',
                data: { landing_page_id },
            });
        }
        // const fqdn = updatedLandingPage.settings?.fqdn || '';
        // const keywordss = updatedLandingPage.keywords?.split(',').map((kwd) => kwd.trim()) || [];
        // const urls = keywordss.map((keyword) => `https://${fqdn}/${slugify(keyword,"-")}`);
        // urls.push( `https://${fqdn}`);
        res.status(200).json({
            result: 200,
            msg: `Landing Page ${updatedLandingPage.title} is ${status}.`,
            data: {
                account_id: updatedLandingPage.account_id,
                account_num: updatedLandingPage.account_num,
                status,
                title: updatedLandingPage.title,
                urls: updatedLandingPage.urls
            },
        });
    }
    catch (error) {
        console.error('Error updating landing page status:', error);
        res.status(500).json({ result: 500, error: 'Internal server error' });
    }
});
exports.updateLandingPageStatus = updateLandingPageStatus;
const updateLandingPageChatbot = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { landing_page_id } = req.params;
    const { chatbot_num } = req.body;
    try {
        const LandingPage = (0, landingPage_1.createLandingPageModel)(infraDBConnection_1.default);
        const Chatbot = infraDBConnection_1.default.model('Chatbot'); // Assuming Chatbot model exists
        const chatbot = yield Chatbot.findOne({ chatbot_num });
        if (!chatbot) {
            return res.status(404).json({
                result: 404,
                error: 2009,
                msg: 'Chatbot not found',
                desc: 'Specified Chatbot is invalid.',
                data: { chatbot_num },
            });
        }
        const updatedLandingPage = yield LandingPage.findByIdAndUpdate(landing_page_id, {
            chatbot_id: chatbot._id,
            chatbot_num: chatbot.chatbot_num,
            'track.modified': (0, moment_1.default)().toISOString(),
        }, { new: true });
        if (!updatedLandingPage) {
            return res.status(404).json({
                result: 404,
                error: 2008,
                msg: 'Landing Page not found',
                desc: 'Specified Landing Page is invalid.',
                data: { landing_page_id },
            });
        }
        // const fqdn = updatedLandingPage.settings?.fqdn || '';
        // const keywordss = updatedLandingPage.keywords?.split(',').map((kwd) => kwd.trim()) || [];
        // const urls = keywordss.map((keyword) => `https://${fqdn}/${slugify(keyword,"-")}`);
        // urls.push( `https://${fqdn}`);
        res.status(200).json({
            result: 200,
            msg: `Chatbot is updated for Landing Page ${updatedLandingPage.title}.`,
            data: {
                account_id: updatedLandingPage.account_id,
                account_num: updatedLandingPage.account_num,
                chatbot_id: chatbot._id,
                chatbot_num: chatbot.chatbot_num,
                title: updatedLandingPage.title,
                urls: updatedLandingPage.urls
            },
        });
    }
    catch (error) {
        console.error('Error updating landing page chatbot:', error);
        res.status(500).json({ result: 500, error: 'Internal server error' });
    }
});
exports.updateLandingPageChatbot = updateLandingPageChatbot;
