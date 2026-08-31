const { z } = require("zod");

const uuid = z.string().uuid();

const createJobSchema = z.object({
  body: z.object({
    title: z.string().min(2).max(160),
    department: z.string().max(120).optional(),
    location: z.string().max(160).optional(),
  }),
  params: z.object({}),
  query: z.object({}),
});

const updateJobSchema = z.object({
  body: z.object({
    title: z.string().min(2).max(160).optional(),
    department: z.string().max(120).nullable().optional(),
    location: z.string().max(160).nullable().optional(),
    status: z.enum(["OPEN", "PAUSED", "CLOSED"]).optional(),
  }).refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  }),
  params: z.object({ id: uuid }),
  query: z.object({}),
});

const jobIdSchema = z.object({
  body: z.object({}),
  params: z.object({ id: uuid }),
  query: z.object({}),
});

module.exports = { createJobSchema, updateJobSchema, jobIdSchema };
