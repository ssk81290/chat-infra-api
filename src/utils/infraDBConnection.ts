
import mongoose from 'mongoose';

// Create a new connection to a specific MongoDB database
const infraDBConnection = mongoose.createConnection(process.env.INFRA_MONGO_URI!);

infraDBConnection.on('connected', () => {
  console.log('Connected to Chatbot Database');
});

export default infraDBConnection;
