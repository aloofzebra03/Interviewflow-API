const { z } = require("zod");

const uuid = z.string().uuid();
const stageEnum = z.enum(["APPLIED", "SCREENING", "INTERVIEW", "OFFER", "HIRED", "REJECTED"]);

const createCandidateSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(120),
    email: z.string().email(),
    score: z.number().int().min(0).max(100).optional(),
    notes: z.string().max(3000).optional(),
  }),
  params: z.object({ jobId: uuid }),
  query: z.object({}),
});

const updateCandidateSchema = z.object({
  body: z.object({
    stage: stageEnum.optional(),
    score: z.number().int().min(0).max(100).nullable().optional(),
    notes: z.string().max(3000).nullable().optional(),
  }).refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  }),
  params: z.object({ id: uuid }),
  query: z.object({}),
});

const listCandidatesSchema = z.object({
  body: z.object({}),
  params: z.object({ jobId: uuid }),
  query: z.object({
    stage: stageEnum.optional(),
    minScore: z.coerce.number().int().min(0).max(100).optional(),
  }),
});

module.exports = {
  createCandidateSchema,
  updateCandidateSchema,
  listCandidatesSchema,
};
