const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

const authRoutes = require("./routes/auth.routes");
const propertyRoutes = require("./routes/property.routes");
const connectDB = require("./config/db");
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

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

app.get("/api/health", (req, res) => {
    res.json({
        message: "StayNear backend is running!"
    });
});

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
