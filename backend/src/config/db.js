const mongoose = require("mongoose");
const dns = require("dns");

let connectionPromise = null;

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is missing from backend/.env");
        }

        if (mongoose.connection.readyState === 1) {
            return mongoose.connection;
        }

        if (connectionPromise) {
            return connectionPromise;
        }

        if (process.env.MONGO_URI.startsWith("mongodb+srv://")) {
            dns.setServers(["8.8.8.8", "1.1.1.1"]);
        }

        connectionPromise = mongoose.connect(process.env.MONGO_URI, {
            dbName: process.env.MONGO_DB_NAME || "staynear"
        });

        await connectionPromise;

        console.log("MongoDB connected successfully");
        return mongoose.connection;
    } catch (error) {
        connectionPromise = null;
        console.error("MongoDB connection failed:");
        console.error(error.message);

        throw error;
    }
};

module.exports = connectDB;
