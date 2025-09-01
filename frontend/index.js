const express = require("express");
const path = require("path");
const app = express();
const PORT = 3000;

// Serve static files from current directory
app.use(express.static(__dirname));

// Routes for all HTML pages
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/home", (req, res) => {
  res.sendFile(path.join(__dirname, "home.html"));
});

app.get("/rooms", (req, res) => {
  res.sendFile(path.join(__dirname, "rooms.html"));
});

app.get("/dining", (req, res) => {
  res.sendFile(path.join(__dirname, "dining.html"));
});

app.get("/gallery", (req, res) => {
  res.sendFile(path.join(__dirname, "gallery.html"));
});

app.get("/contact", (req, res) => {
  res.sendFile(path.join(__dirname, "contact.html"));
});

app.get("/view-bookings", (req, res) => {
  res.sendFile(path.join(__dirname, "view-bookings.html"));
});

app.listen(PORT, () => {
  console.log(`✅ Frontend running at http://localhost:${PORT}`);
  console.log(`📁 Serving files from: ${__dirname}`);
});
