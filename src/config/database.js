const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const {
            DB_MONGO_HOST,
            DB_MONGO_PORT,
            DB_MONGO_DATABASE,
            DB_MONGO_USERNAME,
            DB_MONGO_PASSWORD
        } = process.env;

        const uri = `mongodb://${DB_MONGO_USERNAME}:${DB_MONGO_PASSWORD}@${DB_MONGO_HOST}:${DB_MONGO_PORT}/${DB_MONGO_DATABASE}?authSource=admin`;

        await mongoose.connect(uri);
        console.log('✅ MongoDB connected');
    } catch (err) {
        console.error('❌ MongoDB connection error:', err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
