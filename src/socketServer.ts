// src/socketServer.ts
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import { connectRabbitMQ, publishToQueue } from "./utils/rabbitMQ";
import jwt from "jsonwebtoken";
import {createTokenModel} from "./models/chatRoomToken"; // Token model
import {createChatRoomModel} from "./models/chatRoom"; // Chat Room model
import infraDBConnection from "./utils/infraDBConnection";
import  {createChatbotModel} from "./models/chatbot"; // Chat Room model
import chatRoomDBConnection from "./utils/chatRoomConnection";

const Token   = createTokenModel(chatRoomDBConnection)
const ChatBot =   createChatbotModel(infraDBConnection);
const ChatRoom = createChatRoomModel(infraDBConnection);
const io = new Server(3000, {
  cors: {
    origin: "*", // Allow CORS for all origins
  },
});

const MESSAGE_QUEUE = "chatroom_messages"; // RabbitMQ queue name

// Connect to RabbitMQ
connectRabbitMQ();

// Maintain chat history and connected users
const chatHistory: { [key: string]: any[] } = {};
const connectedUsers: { [key: string]: Set<string> } = {};

// Handle WebSocket connection events
io.on("connection", (socket) => {
  //console.log("A user connected");
  socket.on("user_joining", async (token: string) => {
    try {
      // Decode and validate token
      const decodedToken: any = jwt.verify(token, process.env.JWT_SECRET!);
      const chatroom_id = decodedToken.chatroom_id;
      const user_ref = decodedToken.user.user_ref;

      // Fetch the chatroom from the DB
      const chatRoom = await ChatRoom.findById(chatroom_id);
      if (!chatRoom) {
        socket.emit("error", "Chatroom not found");
        return;
      }
      const chatbot = await ChatBot.findById(chatRoom.chatbot_id);

      // Check if the chatroom has capacity for new users

      // todo role based evaluations
      if (chatRoom.in_session.users >= chatRoom.capacity.users) {
        socket.emit("error", "Chatroom is full");
        return;
      }

      // Add user to the chatroom
      if (!connectedUsers[chatroom_id]) {
        connectedUsers[chatroom_id] = new Set();
      }
      connectedUsers[chatroom_id].add(user_ref);

      // Update the connected user count in the chatroom
       // todo role based additions
      chatRoom.in_session.users += 1;
      await chatRoom.save();

      // Remove the token from the DB after successful join
      await Token.findOneAndDelete({ token_id: decodedToken.token_id });

      // Send the chat history to the user
      socket.emit("show_latestChat", chatHistory[chatroom_id] || []);
      socket.emit("show_topics", chatbot?.topics || []);
      socket.emit("show_connected_users",connectedUsers[chatroom_id] || [] )

      // Notify the chatroom that a new user has joined
      socket.to(chatroom_id).emit("user_joined", { user_ref });

      // Join the user to the chatroom
      socket.join(chatroom_id);

    } catch (err) {
      socket.emit("error", "Invalid or expired token");
    }
  });


  socket.on("message", async (msg, token) => {
    try {
      // Decode the token to get user details
      const decodedToken: any = jwt.verify(token, process.env.JWT_SECRET!);
      const chatroom_id = decodedToken.chatroom_id;
      const sender_id = decodedToken.user.user_ref;
      const sender_name = decodedToken.user.name;

      // Create a new message object with additional fields
      let newMessage = {
        msg_id: uuidv4(), // Unique message ID
        sender: {
          user_id: sender_id, // Sender's user ID
          auth_id: decodedToken.user.auth_id, // Sender's authentication ID
          name: sender_name // Sender's name
        },
        timestamp: new Date(), // Timestamp of the message
        content: msg.content, // Original message content
        account_id: decodedToken.account_num, // Account ID from the token
        chatbot_id: decodedToken.chatbot_num, // Chatbot ID from the token
        chatroom_id: chatroom_id, // Chatroom ID
      };

      // Add the message to the chat history (last 20 messages)
      if (!chatHistory[chatroom_id]) {
        chatHistory[chatroom_id] = [];
      }
      chatHistory[chatroom_id].push(newMessage);
      if (chatHistory[chatroom_id].length > parseInt(process.env.CHAT_HISTORY!)) {
        chatHistory[chatroom_id].shift(); // Keep only the last 20 messages
      }

      // Broadcast the message to other users in the same chatroom
      io.to(chatroom_id).emit("message", newMessage);

      await publishToQueue(MESSAGE_QUEUE, newMessage);
      
    } catch (err) {
      socket.emit("error", "Message sending failed");
    }
  });



 // Handle user disconnecting
 socket.on("disconnect", async () => {
    const chatroom_id = Object.keys(connectedUsers).find(room =>
      connectedUsers[room].has(socket.id)
    );

    if (chatroom_id) {
      connectedUsers[chatroom_id].delete(socket.id);

      // Update the user count in the chatroom
      const chatRoom = await ChatRoom.findById(chatroom_id);
      if (chatRoom) {
        //role base deductions
        chatRoom.in_session.users -= 1;
        await chatRoom.save();
      }

      // Notify the chatroom that a user has left
      socket.to(chatroom_id).emit("user_left", socket.id);
    }

    console.log("A user disconnected");
  });
});

console.log("Socket.io server is running on port 3000");
