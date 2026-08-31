const pool = require("../config/db");

async function assertOwnedJob(jobId, userId) {
  const result = await pool.query(
    "SELECT id FROM jobs WHERE id = $1 AND owner_id = $2",
    [jobId, userId]
  );

  return result.rowCount > 0;
}

async function createCandidate(req, res) {
  const { jobId } = req.validated.params;
  const { name, email, score, notes } = req.validated.body;

  const ownsJob = await assertOwnedJob(jobId, req.user.id);
  if (!ownsJob) {
    return res.status(404).json({ error: "Job not found" });
  }

  const result = await pool.query(
    `INSERT INTO candidates (job_id, name, email, score, notes)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [jobId, name, email, score ?? null, notes ?? null]
  );

  return res.status(201).json(result.rows[0]);
}

async function listCandidates(req, res) {
  const { jobId } = req.validated.params;
  const { stage, minScore } = req.validated.query;

  const ownsJob = await assertOwnedJob(jobId, req.user.id);
  if (!ownsJob) {
    return res.status(404).json({ error: "Job not found" });
  }

  const filters = ["job_id = $1"];
  const values = [jobId];

  if (stage) {
    values.push(stage);
    filters.push(`stage = $${values.length}`);
  }

  if (minScore !== undefined) {
    values.push(minScore);
    filters.push(`score >= $${values.length}`);
  }

  const result = await pool.query(
    `SELECT *
     FROM candidates
     WHERE ${filters.join(" AND ")}
     ORDER BY created_at DESC`,
    values
  );

  return res.json(result.rows);
}

async function updateCandidate(req, res) {
  const { id } = req.validated.params;
  const updates = req.validated.body;

  const existing = await pool.query(
    `SELECT c.*
     FROM candidates c
     JOIN jobs j ON j.id = c.job_id
     WHERE c.id = $1 AND j.owner_id = $2`,
    [id, req.user.id]
  );

  if (existing.rowCount === 0) {
    return res.status(404).json({ error: "Candidate not found" });
  }

  const candidate = existing.rows[0];

  const result = await pool.query(
    `UPDATE candidates
     SET stage = $1,
         score = $2,
         notes = $3,
         updated_at = NOW()
     WHERE id = $4
     RETURNING *`,
    [
      updates.stage ?? candidate.stage,
      updates.score !== undefined ? updates.score : candidate.score,
      updates.notes !== undefined ? updates.notes : candidate.notes,
      id,
    ]
  );

  return res.json(result.rows[0]);
}

async function pipelineSummary(req, res) {
  const { jobId } = req.params;

  const ownsJob = await assertOwnedJob(jobId, req.user.id);
  if (!ownsJob) {
    return res.status(404).json({ error: "Job not found" });
  }

  const result = await pool.query(
    `SELECT stage, COUNT(*)::int AS count
     FROM candidates
     WHERE job_id = $1
     GROUP BY stage
     ORDER BY stage`,
    [jobId]
  );

  const total = result.rows.reduce((sum, row) => sum + row.count, 0);

  return res.json({
    jobId,
    totalCandidates: total,
    stages: result.rows,
  });
}

module.exports = {
  createCandidate,
  listCandidates,
  updateCandidate,
  pipelineSummary,
};
