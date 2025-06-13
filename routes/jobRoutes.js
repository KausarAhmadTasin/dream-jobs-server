const express = require("express");
const router = express.Router();
const jobController = require("../controllers/jobController");

router.get("/", jobController.getJobs);
router.post("/", jobController.createJob);
router.get("/Count", jobController.getJobCount);
router.get("/:id", jobController.getJobById);
router.patch("/:id/apply", jobController.applyForJob);
router.delete("/myJobs/:id", jobController.deleteJob);
router.put("/myJobs/:id", jobController.updateJob);
router.get("/logos", jobController.getLogos);

module.exports = router;
