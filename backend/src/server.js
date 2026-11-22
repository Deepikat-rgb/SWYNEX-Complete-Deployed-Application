require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const pool = require("./db");
const menuRoutes = require("./routes/menu");
const orderRoutes = require("./routes/orders");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch (error) {
    console.error("Health check database error:", error.message);
    res.status(500).json({ status: "error", message: "Database connection failed" });
  }
});
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);

// Serve the student portal and staff dashboard from the same deployed service.
const frontendPath = path.join(__dirname, "../../frontend");
app.use(express.static(frontendPath));
app.get("/", (req, res) => res.sendFile(path.join(frontendPath, "index.html")));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const port = Number(process.env.PORT || 5000);
app.listen(port, () => console.log(`Canteen application running on port ${port}`));
