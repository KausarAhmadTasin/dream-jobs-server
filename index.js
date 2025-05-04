const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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

const logger = (req, res, next) => {
  next();
};

const varifyToken = (req, res, next) => {
  const token = req?.cookies?.token;
  if (!token) {
    return res.status(401).send({ messege: "Unauthorized access" });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ messege: "Unauthorized access" });
    }
    req.user = decoded;
    next();
  });
};

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.dqs9o84.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production" ? true : false,
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
};

async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    // await client.connect();

    // Get the database and collection on which to run the operation
    const jobCollection = client.db("dreamJobs").collection("jobCollection");
    const applicantsCollection = client
      .db("dreamJobs")
      .collection("applicantsCollection");

    // Auth related apis
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });
      res.cookie("token", token, cookieOptions).send({ success: true });
    });

    app.post("/logout", async (req, res) => {
      const user = req.body;

      res
        .clearCookie("token", { ...cookieOptions, maxAge: 0 })
        .send({ success: true });
    });

    // Services related apis

    app.get("/jobs", async (req, res) => {
      let query = {};

      if (req.query?.email) {
        query = { employer_email: req.query.email };
      }

      if (req.query?.type) {
        query = { job_type: req.query.type };
      }

      if (req.query?.title) {
        query.job_title = { $regex: req.query.title, $options: "i" };
      }

      const page = parseInt(req.query?.page) || 0;
      const size = parseInt(req.query?.size) || 15;

      const cursor = jobCollection.find(query);
      const result = await cursor
        .skip(page * size)
        .limit(size)
        .toArray();
      res.send(result);
    });

    app.post("/jobs", async (req, res) => {
      const job = req.body;

      const result = await jobCollection.insertOne(job);
      res.send(result);
    });

    app.get("/jobsCount", async (req, res) => {
      let query = {};

      if (req.query?.email) {
        query = { employer_email: req.query.email };
      }

      const count = await jobCollection.countDocuments(query);
      res.send({ count });
    });

    app.get("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobCollection.findOne(query);
      res.send(result);
    });

    app.patch("/jobs/:id/apply", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const operations = { upsert: true };
      const updateApplicanstNumber = { $inc: { applicants: 1 } };

      const result = await jobCollection.updateOne(
        filter,
        updateApplicanstNumber,
        operations
      );

      res.send(result);
    });

    app.delete("/myJobs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobCollection.deleteOne(query);

      res.send(result);
    });

    app.put("/myJobs/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const edittedJob = req.body;

      const editJob = {
        $set: {
          bonus: edittedJob.bonus,
          company: edittedJob.company,
          photoUrl: edittedJob.photoUrl,
          deadline: edittedJob.deadline,
          deadline_start: edittedJob.deadline_start,
          employer: edittedJob.employer,
          employer_email: edittedJob.employer_email,
          increment: edittedJob.increment,
          job_posting_date: edittedJob.job_posting_date,
          job_title: edittedJob.job_title,
          job_type: edittedJob.job_type,
          location: edittedJob.location,
          other_benefits: edittedJob.other_benefits,
          probation_period: edittedJob.probation_period,
          requirements: edittedJob.requirements,
          responsibilities: edittedJob.responsibilities,
          salary_max: edittedJob.salary_max,
          salary_min: edittedJob.salary_min,
          vacancy: edittedJob.vacancy,
          weekends: edittedJob.weekends,
          applicants: edittedJob.applicants,
        },
      };

      const result = await jobCollection.updateOne(filter, editJob);
      res.send(result);
    });

    app.get("/logos", async (req, res) => {
      const query = {};
      const options = { projection: { photoUrl: 1, _id: 1, company: 1 } };
      const result = await jobCollection
        .find(query, options)
        .limit(20)
        .toArray();
      res.send(result);
    });

    app.get("/application", logger, varifyToken, async (req, res) => {
      let query = {};

      if (req.query?.applicant_email) {
        query = { applicant_email: req.query.applicant_email };
      }
      if (req.query?.employer_email) {
        query = { employer_email: req.query.employer_email };
      }

      console.log("token owner", req.user);
      if (
        req?.user.email !== req.query?.applicant_email &&
        req?.user.email !== req.query?.employer_email
      ) {
        return res.status(403).send({ messege: "Forbiden access" });
      }

      const result = await applicantsCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/application", async (req, res) => {
      const application = req.body;

      const result = await applicantsCollection.insertOne(application);
      res.send(result);
    });

    app.delete("/application/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await applicantsCollection.deleteOne(query);

      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Dream Jobs server is running");
});

app.listen(port, () => {
  console.log(`Dream Jobs server is runnign at port ${port}`);
});
