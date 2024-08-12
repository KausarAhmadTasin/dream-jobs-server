const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.dqs9o84.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();

    // Get the database and collection on which to run the operation
    const jobCollection = client.db("dreamJobs").collection("jobCollection");

    app.get("/jobs", async (req, res) => {
      let query = {};

      if (req.query?.email) {
        query = { employer_email: req.query.email };
      }

      if (req.query?.type) {
        query = { job_type: req.query.type };
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

    app.get("/jobs", async (req, res) => {
      let query = {};

      if (req.query?.email) {
        query = { employer_email: req.query.email };
      }
      const cursor = jobCollection.find(query);
      const result = await cursor.toArray();
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

    app.get("/logos", async (req, res) => {
      const query = {};
      const options = { projection: { photoUrl: 1, _id: 1, company: 1 } };
      const result = await jobCollection
        .find(query, options)
        .limit(20)
        .toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
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
