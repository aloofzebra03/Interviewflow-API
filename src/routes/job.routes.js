const express = require("express");
const requireAuth = require("../middleware/auth");
const validate = require("../middleware/validate");
const asyncHandler = require("../utils/asyncHandler");
const {
  createJobSchema,
  updateJobSchema,
  jobIdSchema,
} = require("../validators/job.validators");
const {
  createJob,
  listJobs,
  getJob,
  updateJob,
  deleteJob,
} = require("../controllers/job.controller");

const router = express.Router();

router.use(requireAuth);

router.post("/", validate(createJobSchema), asyncHandler(createJob));
router.get("/", asyncHandler(listJobs));
router.get("/:id", validate(jobIdSchema), asyncHandler(getJob));
router.patch("/:id", validate(updateJobSchema), asyncHandler(updateJob));
router.delete("/:id", validate(jobIdSchema), asyncHandler(deleteJob));

module.exports = router;
