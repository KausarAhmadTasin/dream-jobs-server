const express = require("express");
const router = express.Router();
const applicationController = require("../controllers/applicationController");
const { verifyToken, logger } = require("../middlewares/authMiddleware");

router.get("/", logger, verifyToken, applicationController.getApplications);
router.post("/", applicationController.createApplication);
router.delete("/:id", applicationController.deleteApplication);

module.exports = router;
