import mongoose from 'mongoose';
import config from '../config/env';

export async function connectToDatabase(): Promise<void> {
  try {
    await mongoose.connect(config.MONGODB_URI);
    // eslint-disable-next-line no-console
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
}


