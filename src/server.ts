// src/server.ts
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cluster from 'cluster';
import os from 'os';
import accountRoutes from './routes/accountRoutes';
import chatbotRoutes from './routes/chatbotRoutes';
import indexRoutes from './routes/index';


dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const numCPUs = os.cpus().length;

app.use(express.json());

app.use(chatbotRoutes);
app.use(accountRoutes);
app.use(indexRoutes);
// MongoDB connection
mongoose.connect(process.env.INFRA_MONGO_URI!, {})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

  mongoose.connect(process.env.CHATROOM_MONGO_URI!, {})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));
// Cluster setup
if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
  });
} else {
  app.listen(PORT, () => {
    console.log(`Worker ${process.pid} listening on port ${PORT}`);
  });
}
