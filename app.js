const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const routes = require("./routes");

const app = express();

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://dream-jobs-fae96.web.app",
      "https://dream-jobs-fae96.firebaseapp.com",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api", routes);

// Test route
app.get("/", (req, res) => {
  res.send("Dream Jobs server is running");
});

module.exports = app;
