const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
// --- MODIFIED: Removed sequelize import, only need connectDB from Mongoose config ---
const { connectDB } = require("./src/config/db");
const contactRoutes = require("./src/routes/contactRoutes");

dotenv.config();
const app = express();

// --- START FIX: TEMPORARILY ALLOW ALL ORIGINS TO RULE OUT CORS ISSUE ---
// This is for TESTING purposes only. Revert to the specific allowedOrigins list later.
const corsOptions = {
    origin: "*", // Allow ALL origins for testing
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true, // Allow cookies and authentication headers
    optionsSuccessStatus: 204
};

// 1. Apply configured CORS middleware
app.use(cors(corsOptions));
// --- END FIX ---

app.use(express.json());
app.use("/api/contacts", contactRoutes);

const PORT = process.env.PORT || 5000;

(async () => {
    // 1. Call the Mongoose connectDB function
    await connectDB();
    
    // --- REMOVED: Deleted the sequelize.sync() call, as it is no longer relevant for MongoDB ---
    
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
})();
