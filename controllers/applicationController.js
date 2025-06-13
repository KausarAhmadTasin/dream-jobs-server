const { ObjectId } = require("mongodb");
const connectDB = require("../config/db");

exports.getApplications = async (req, res) => {
  try {
    const db = await connectDB();
    const applicantsCollection = db.collection("applicantsCollection");

    let query = {};
    if (req.query?.applicant_email)
      query = { applicant_email: req.query.applicant_email };
    if (req.query?.employer_email)
      query = { employer_email: req.query.employer_email };

    console.log("token owner", req.user);
    if (
      req?.user.email !== req.query?.applicant_email &&
      req?.user.email !== req.query?.employer_email
    ) {
      return res.status(403).send({ message: "Forbidden access" });
    }

    const result = await applicantsCollection.find(query).toArray();
    res.send(result);
  } catch (error) {
    console.error("Error getting applications:", error);
    res.status(500).send({ message: "Internal server error" });
  }
};

exports.createApplication = async (req, res) => {
  try {
    const db = await connectDB();
    const applicantsCollection = db.collection("applicantsCollection");
    const application = req.body;

    const result = await applicantsCollection.insertOne(application);
    res.send(result);
  } catch (error) {
    console.error("Error creating application:", error);
    res.status(500).send({ message: "Internal server error" });
  }
};

exports.deleteApplication = async (req, res) => {
  try {
    const db = await connectDB();
    const applicantsCollection = db.collection("applicantsCollection");
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await applicantsCollection.deleteOne(query);
    res.send(result);
  } catch (error) {
    console.error("Error deleting application:", error);
    res.status(500).send({ message: "Internal server error" });
  }
};
