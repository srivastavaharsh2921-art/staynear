const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

const authRoutes = require("./routes/auth.routes");
const propertyRoutes = require("./routes/property.routes");
const connectDB = require("./config/db");
dotenv.config({ path: path.join(__dirname, "../.env") });
dotenv.config();

const app = express();
const allowedOrigins = [
    "https://staynearr.netlify.app",
    "http://localhost:3000",
    "http://localhost:5000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5000"
];

const isAllowedOrigin = (origin) => {
    if (!origin) return true;
    if (allowedOrigins.includes(origin)) return true;
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
    if (origin.endsWith(".netlify.app") || origin.endsWith(".vercel.app")) return true;
    return false;
};

// Middleware
app.use(
    cors({
        origin(origin, callback) {
            if (isAllowedOrigin(origin)) {
                callback(null, true);
                return;
            }

            callback(new Error("Not allowed by CORS"));
        }
    })
);
app.use(express.json());

app.get("/api/health", (req, res) => {
    res.json({
        message: "StayNear backend is running!"
    });
});

app.use(async (req, res, next) => {
    if (req.path.startsWith("/api")) {
        try {
            await connectDB();
        } catch (error) {
            return res.status(500).json({
                message: "Database connection failed"
            });
        }
    }

    next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);

app.use(express.static(path.join(__dirname, "../../frontend")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../../frontend/index.html"));
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
    connectDB()
        .then(() => {
            app.listen(PORT, () => {
                console.log(`StayNear backend running on port ${PORT}`);
            });
        })
        .catch(() => {
            process.exit(1);
        });
}

module.exports = app;
