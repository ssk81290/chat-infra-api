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
exports.consumeFromQueue = exports.publishToQueue = void 0;
// src/utils/rabbitMQ.ts
const amqplib_1 = __importDefault(require("amqplib"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// let channel: amqp.Channel | null = null;
const connectRabbitMQ = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const connection = yield amqplib_1.default.connect(process.env.RABBITMQ_URL);
        let channel = yield connection.createChannel();
        return channel;
        console.log("Connected to RabbitMQ");
    }
    catch (error) {
        console.error("Failed to connect to RabbitMQ", error);
    }
});
// Publish message to RabbitMQ
const publishToQueue = (queue, message) => __awaiter(void 0, void 0, void 0, function* () {
    let channel = yield connectRabbitMQ();
    console.log(channel);
    if (channel) {
        yield channel.assertQueue(queue, { durable: true });
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
            persistent: true,
        });
        console.log("Message published to queue:", queue);
    }
});
exports.publishToQueue = publishToQueue;
// Consume message from RabbitMQ
const consumeFromQueue = (queue, callback) => __awaiter(void 0, void 0, void 0, function* () {
    let channel = yield connectRabbitMQ();
    if (channel) {
        yield channel.assertQueue(queue, { durable: true });
        channel.consume(queue, callback, { noAck: true });
        console.log("Started consuming messages from queue:", queue);
    }
});
exports.consumeFromQueue = consumeFromQueue;
