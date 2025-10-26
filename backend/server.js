// server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { connectDB, sequelize } = require("./src/config/db");
const contactRoutes = require("./src/routes/contactRoutes");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/contacts", contactRoutes);

const PORT = process.env.PORT || 5000;

(async () => {
  await connectDB();
  await sequelize.sync({ alter: true }); // Creates or updates the table automatically
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
})();
