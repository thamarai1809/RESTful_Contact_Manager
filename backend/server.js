const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
// --- MODIFIED: Removed sequelize import, only need connectDB from Mongoose config ---
const { connectDB } = require("./src/config/db");
const contactRoutes = require("./src/routes/contactRoutes");

dotenv.config();
const app = express();

// --- START FIX: Custom CORS Configuration (KEPT AS IS) ---
const allowedOrigins = [
    // IMPORTANT: Allowing your live Vercel frontend domain!
    "https://res-tful-contact-manager.vercel.app", 
    // Allowing local development environments
    "http://localhost:3000",
    "http://localhost:5173" 
];

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl)
        if (!origin) return callback(null, true); 
        
        // Check if the requesting origin is in the allowed list
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            // Block all other origins
            callback(new Error('Not allowed by CORS'));
        }
    },
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
