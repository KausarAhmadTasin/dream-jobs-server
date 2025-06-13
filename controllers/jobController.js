const { ObjectId } = require("mongodb");
const connectDB = require("../config/db");

exports.getJobs = async (req, res) => {
  try {
    const db = await connectDB();
    const jobCollection = db.collection("jobCollection");

    let query = {};
    if (req.query?.email) query = { employer_email: req.query.email };
    if (req.query?.type) query = { job_type: req.query.type };
    if (req.query?.title)
      query.job_title = { $regex: req.query.title, $options: "i" };

    const page = parseInt(req.query?.page) || 0;
    const size = parseInt(req.query?.size) || 15;

    const cursor = jobCollection.find(query);
    const result = await cursor
      .skip(page * size)
      .limit(size)
      .toArray();
    res.send(result);
  } catch (error) {
    console.error("Error getting jobs:", error);
    res.status(500).send({ message: "Internal server error" });
  }
};

exports.createJob = async (req, res) => {
  try {
    const db = await connectDB();
    const jobCollection = db.collection("jobCollection");
    const job = req.body;

    const result = await jobCollection.insertOne(job);
    res.send(result);
  } catch (error) {
    console.error("Error creating job:", error);
    res.status(500).send({ message: "Internal server error" });
  }
};

exports.getJobCount = async (req, res) => {
  try {
    const db = await connectDB();
    const jobCollection = db.collection("jobCollection");
    let query = {};

    if (req.query?.email) {
      query = { employer_email: req.query.email };
    }

    const count = await jobCollection.countDocuments(query);
    res.send({ count });
  } catch (error) {
    console.error("Error getting job count:", error);
    res.status(500).send({ message: "Internal server error" });
  }
};

exports.getJobById = async (req, res) => {
  try {
    const db = await connectDB();
    const jobCollection = db.collection("jobCollection");
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await jobCollection.findOne(query);
    res.send(result);
  } catch (error) {
    console.error("Error getting job by ID:", error);
    res.status(500).send({ message: "Internal server error" });
  }
};

exports.applyForJob = async (req, res) => {
  try {
    const db = await connectDB();
    const jobCollection = db.collection("jobCollection");
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const operations = { upsert: true };
    const updateApplicantsNumber = { $inc: { applicants: 1 } };

    const result = await jobCollection.updateOne(
      filter,
      updateApplicantsNumber,
      operations
    );
    res.send(result);
  } catch (error) {
    console.error("Error applying for job:", error);
    res.status(500).send({ message: "Internal server error" });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const db = await connectDB();
    const jobCollection = db.collection("jobCollection");
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await jobCollection.deleteOne(query);
    res.send(result);
  } catch (error) {
    console.error("Error deleting job:", error);
    res.status(500).send({ message: "Internal server error" });
  }
};

exports.updateJob = async (req, res) => {
  try {
    const db = await connectDB();
    const jobCollection = db.collection("jobCollection");
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const editedJob = req.body;

    const editJob = {
      $set: {
        bonus: editedJob.bonus,
        company: editedJob.company,
        photoUrl: editedJob.photoUrl,
        deadline: editedJob.deadline,
        deadline_start: editedJob.deadline_start,
        employer: editedJob.employer,
        employer_email: editedJob.employer_email,
        increment: editedJob.increment,
        job_posting_date: editedJob.job_posting_date,
        job_title: editedJob.job_title,
        job_type: editedJob.job_type,
        location: editedJob.location,
        other_benefits: editedJob.other_benefits,
        probation_period: editedJob.probation_period,
        requirements: editedJob.requirements,
        responsibilities: editedJob.responsibilities,
        salary_max: editedJob.salary_max,
        salary_min: editedJob.salary_min,
        vacancy: editedJob.vacancy,
        weekends: editedJob.weekends,
        applicants: editedJob.applicants,
      },
    };

    const result = await jobCollection.updateOne(filter, editJob);
    res.send(result);
  } catch (error) {
    console.error("Error updating job:", error);
    res.status(500).send({ message: "Internal server error" });
  }
};

exports.getLogos = async (req, res) => {
  try {
    const db = await connectDB();
    const jobCollection = db.collection("jobCollection");
    const query = {};
    const options = { projection: { photoUrl: 1, _id: 1, company: 1 } };
    const result = await jobCollection.find(query, options).limit(20).toArray();
    res.send(result);
  } catch (error) {
    console.error("Error getting logos:", error);
    res.status(500).send({ message: "Internal server error" });
  }
};
