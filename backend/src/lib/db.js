import mongoose from 'mongoose';

export const connectDB = async() => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB successfully', conn.connection.host );
    } catch (error) {
        console.error('Error connection to MongoDB:', error);
        process.exit(1); // 1 status code indicates failure, 0 indicates success

        
    } ;
};