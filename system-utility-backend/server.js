const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require('dotenv').config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());


mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('Connection error:', err));

const systemInfoSchema = new mongoose.Schema({
  machine_id: String,
  os: String,
  os_version: String,
  os_release: String,
  disk_encryption: Boolean,
  os_update: String,
  antivirus: Boolean,
  sleep_setting_ok: Boolean,
  system_stats: {
    cpu_percent: Number,
    memory_percent: Number,
    disk_percent: Number
  },
  last_check: Date
});
const SystemInfo = mongoose.model('SystemInfo', systemInfoSchema);

app.get("/", (req, res) => {
  res.json({ 
    message: "System Utility API is running", 
    timestamp: new Date().toISOString(),
    status: "OK"
  });
});

app.post("/api/system-info", async (req, res) => {
  try {
    const newEntry = new SystemInfo({
      ...req.body,
      last_check: new Date(req.body.last_check)
    });
    await newEntry.save();
    res.json({ message: "System info saved to database" });
  } catch (err) {
    console.error("Save error:", err);
    res.status(500).json({ error: "Failed to save system info" });
  }
});

app.get("/api/system-info/latest", async (req, res) => {
  try {
    const data = await SystemInfo.findOne().sort({ last_check: -1 });
    res.json(data || { message: "No system info recorded yet" });
  } catch (err) {
    console.error("Latest retrieval error:", err);
    res.status(500).json({ error: "Failed to retrieve latest system info" });
  }
});

app.get("/api/system-info/history", async (req, res) => {
  try {
    const { hours, start, end } = req.query;
    const filter = {};
    
    if (hours) {
      const hoursAgo = new Date(Date.now() - hours * 60 * 60 * 1000);
      filter.last_check = { $gte: hoursAgo };
    }
    
    if (start && end) {
      filter.last_check = {
        $gte: new Date(start),
        $lte: new Date(end)
      };
    }

    const data = await SystemInfo.find(filter).sort({ last_check: -1 });
    res.json(data);
  } catch (err) {
    console.error("History retrieval error:", err);
    res.status(500).json({ error: "Failed to retrieve historical data" });
  }
});


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
