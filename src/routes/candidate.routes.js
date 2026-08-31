const express = require("express");
const { z } = require("zod");
const requireAuth = require("../middleware/auth");
const validate = require("../middleware/validate");
const asyncHandler = require("../utils/asyncHandler");
const {
  createCandidateSchema,
  updateCandidateSchema,
  listCandidatesSchema,
} = require("../validators/candidate.validators");
const {
  createCandidate,
  listCandidates,
  updateCandidate,
  pipelineSummary,
} = require("../controllers/candidate.controller");

const router = express.Router();

router.use(requireAuth);

router.post(
  "/jobs/:jobId/candidates",
  validate(createCandidateSchema),
  asyncHandler(createCandidate)
);

router.get(
  "/jobs/:jobId/candidates",
  validate(listCandidatesSchema),
  asyncHandler(listCandidates)
);

router.get(
  "/jobs/:jobId/pipeline-summary",
  validate(
    z.object({
      body: z.object({}),
      params: z.object({ jobId: z.string().uuid() }),
      query: z.object({}),
    })
  ),
  asyncHandler(pipelineSummary)
);

router.patch(
  "/candidates/:id",
  validate(updateCandidateSchema),
  asyncHandler(updateCandidate)
);

module.exports = router;
