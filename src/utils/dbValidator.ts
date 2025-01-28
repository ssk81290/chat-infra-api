import mongoose from 'mongoose';

export const connectToDatabase = async (dbConfig: any): Promise<boolean> => {
  try {
    const uri = `mongodb://${dbConfig.username}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.namespace}`;
    await mongoose.connect(uri, {});
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
};
