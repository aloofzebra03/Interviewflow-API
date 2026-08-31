const pool = require("../config/db");

async function createJob(req, res) {
  const { title, department, location } = req.validated.body;

  const result = await pool.query(
    `INSERT INTO jobs (owner_id, title, department, location)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [req.user.id, title, department || null, location || null]
  );

  return res.status(201).json(result.rows[0]);
}

async function listJobs(req, res) {
  const result = await pool.query(
    `SELECT
       j.*,
       COUNT(c.id)::int AS candidate_count
     FROM jobs j
     LEFT JOIN candidates c ON c.job_id = j.id
     WHERE j.owner_id = $1
     GROUP BY j.id
     ORDER BY j.created_at DESC`,
    [req.user.id]
  );

  return res.json(result.rows);
}

async function getJob(req, res) {
  const { id } = req.validated.params;

  const result = await pool.query(
    `SELECT
       j.*,
       COUNT(c.id)::int AS candidate_count
     FROM jobs j
     LEFT JOIN candidates c ON c.job_id = j.id
     WHERE j.id = $1 AND j.owner_id = $2
     GROUP BY j.id`,
    [id, req.user.id]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ error: "Job not found" });
  }

  return res.json(result.rows[0]);
}

async function updateJob(req, res) {
  const { id } = req.validated.params;
  const updates = req.validated.body;

  const current = await pool.query(
    "SELECT * FROM jobs WHERE id = $1 AND owner_id = $2",
    [id, req.user.id]
  );

  if (current.rowCount === 0) {
    return res.status(404).json({ error: "Job not found" });
  }

  const job = current.rows[0];

  const result = await pool.query(
    `UPDATE jobs
     SET title = $1,
         department = $2,
         location = $3,
         status = $4,
         updated_at = NOW()
     WHERE id = $5
     RETURNING *`,
    [
      updates.title ?? job.title,
      updates.department !== undefined ? updates.department : job.department,
      updates.location !== undefined ? updates.location : job.location,
      updates.status ?? job.status,
      id,
    ]
  );

  return res.json(result.rows[0]);
}

async function deleteJob(req, res) {
  const { id } = req.validated.params;

  const result = await pool.query(
    "DELETE FROM jobs WHERE id = $1 AND owner_id = $2 RETURNING id",
    [id, req.user.id]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ error: "Job not found" });
  }

  return res.status(204).send();
}

module.exports = { createJob, listJobs, getJob, updateJob, deleteJob };
