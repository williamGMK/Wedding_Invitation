const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, ".."))); // Serve static files from root

// MongoDB connection
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/silver_anniversary";

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// RSVP Schema
const rsvpSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  guests: { type: Number, required: true, min: 1 },
  attending: { type: String, required: true, enum: ["Yes", "No"] },
  message: { type: String, default: "" },
  timestamp: { type: Date, default: Date.now },
});

const RSVP = mongoose.model("RSVP", rsvpSchema);

// Routes

// Get all RSVPs
app.get("/api/rsvp", async (req, res) => {
  try {
    const rsvps = await RSVP.find().sort({ timestamp: -1 });
    res.json({
      success: true,
      data: rsvps,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching RSVPs",
      error: error.message,
    });
  }
});

// Submit new RSVP
app.post("/api/rsvp", async (req, res) => {
  try {
    const { name, email, guests, attending, message } = req.body;

    // Check if email already exists
    const existingRSVP = await RSVP.findOne({ email });
    if (existingRSVP) {
      return res.status(400).json({
        success: false,
        message: "An RSVP with this email already exists",
      });
    }

    const newRSVP = new RSVP({
      name,
      email,
      guests,
      attending,
      message,
    });

    await newRSVP.save();

    res.json({
      success: true,
      message: "RSVP submitted successfully",
      data: newRSVP,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error submitting RSVP",
      error: error.message,
    });
  }
});

// Get RSVP statistics
app.get("/api/rsvp/stats", async (req, res) => {
  try {
    const totalResponses = await RSVP.countDocuments();
    const attending = await RSVP.countDocuments({ attending: "Yes" });
    const notAttending = await RSVP.countDocuments({ attending: "No" });

    // Calculate total guests (sum of guests field)
    const totalGuestsResult = await RSVP.aggregate([
      {
        $group: {
          _id: null,
          totalGuests: { $sum: "$guests" },
        },
      },
    ]);

    const totalGuests =
      totalGuestsResult.length > 0 ? totalGuestsResult[0].totalGuests : 0;

    res.json({
      success: true,
      data: {
        totalResponses,
        attending,
        notAttending,
        totalGuests,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching statistics",
      error: error.message,
    });
  }
});

// Export CSV
app.get("/api/dashboard/export/csv", async (req, res) => {
  try {
    const rsvps = await RSVP.find().sort({ timestamp: -1 });

    // Convert to CSV
    const headers = ["Name", "Email", "Attending", "Guests", "Message", "Date"];
    const csvData = rsvps.map((rsvp) =>
      [
        `"${rsvp.name.replace(/"/g, '""')}"`,
        `"${rsvp.email}"`,
        `"${rsvp.attending}"`,
        `"${rsvp.guests}"`,
        `"${(rsvp.message || "").replace(/"/g, '""')}"`,
        `"${rsvp.timestamp.toISOString()}"`,
      ].join(",")
    );

    const csv = [headers.join(","), ...csvData].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="silver-anniversary-rsvps.csv"'
    );
    res.send(csv);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error exporting CSV",
      error: error.message,
    });
  }
});

// Serve main HTML files
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../index.html"));
});

app.get("/dashboard.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../dashboard.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Main site: http://localhost:${PORT}`);
  console.log(`Dashboard: http://localhost:${PORT}/dashboard.html`);
});
