import mongoose from 'mongoose';
import { ENV } from './env.js';

export const connectDB = async() => {
    try {
        const {MONGO_URI} = ENV;
        if(!MONGO_URI) {
            throw new Error("MONGO_URI is not set");
        }

        
        const conn = await mongoose.connect(ENV.MONGO_URI);
        console.log('Connected to MongoDB successfully', conn.connection.host );
    } catch (error) {
        console.error('Error connection to MongoDB:', error);
        process.exit(1); // 1 status code indicates failure, 0 indicates success

        
    } ;
};