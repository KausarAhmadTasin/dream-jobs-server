const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

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
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");

app.use("/auth", authRoutes);
app.use("/jobs", jobRoutes);
app.use("/application", applicationRoutes);

app.get("/", (req, res) => {
  res.send("Dream Jobs server is running");
});

app.listen(port, () => {
  console.log(`Dream Jobs server is running at port ${port}`);
});
