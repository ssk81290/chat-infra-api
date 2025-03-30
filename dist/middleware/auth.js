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
const infra_access_1 = require("../models/infra_access");
const infraDBConnection_1 = __importDefault(require("../utils/infraDBConnection"));
const Auth = (0, infra_access_1.createAuthModel)(infraDBConnection_1.default);
const basicAuthMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Basic ')) {
        return res.status(401).send('Missing or invalid Authorization header');
    }
    // Decode Base64 encoded credentials
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [access_id, password] = credentials.split(':');
    try {
        // Find user by email
        const user = yield Auth.findOne({ _id: access_id, access_key: password });
        if (!user) {
            return res.status(401).send('Invalid email or password');
        }
        let userData = user.toJSON();
        userData.access_id = userData._id;
        delete userData.status;
        req.body = Object.assign(Object.assign({}, req.body), userData);
        next();
    }
    catch (error) {
        res.status(500).send('Internal server error');
    }
});
exports.default = basicAuthMiddleware;
