"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/server.ts
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cluster_1 = __importDefault(require("cluster"));
const os_1 = __importDefault(require("os"));
const accountRoutes_1 = __importDefault(require("./routes/accountRoutes"));
const chatbotRoutes_1 = __importDefault(require("./routes/chatbotRoutes"));
const index_1 = __importDefault(require("./routes/index"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
const numCPUs = os_1.default.cpus().length;
app.use(express_1.default.json());
app.use(chatbotRoutes_1.default);
app.use(accountRoutes_1.default);
app.use(index_1.default);
// MongoDB connection
// Cluster setup
if (cluster_1.default.isMaster && process.env.ENVIRONMENT == 'production') {
    console.log(`Master ${process.pid} is running`);
    // Fork workers.
    for (let i = 0; i < numCPUs; i++) {
        cluster_1.default.fork();
    }
    cluster_1.default.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
    });
}
else {
    app.listen(PORT, () => {
        console.log(`Worker ${process.pid} listening on port ${PORT}`);
    });
}
