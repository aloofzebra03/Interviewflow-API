const bcrypt = require("bcryptjs");
const pool = require("../config/db");
const { signToken } = require("../utils/jwt");

async function register(req, res) {
  const { name, email, password } = req.validated.body;

  const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
  if (existing.rowCount > 0) {
    return res.status(409).json({ error: "Email already registered" });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, created_at`,
    [name, email, passwordHash]
  );

  const user = result.rows[0];
  const token = signToken({ id: user.id, email: user.email });

  return res.status(201).json({ user, token });
}

async function login(req, res) {
  const { email, password } = req.validated.body;

  const result = await pool.query(
    "SELECT id, name, email, password_hash FROM users WHERE email = $1",
    [email]
  );

  if (result.rowCount === 0) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const user = result.rows[0];
  const validPassword = await bcrypt.compare(password, user.password_hash);

  if (!validPassword) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = signToken({ id: user.id, email: user.email });

  return res.json({
    user: { id: user.id, name: user.name, email: user.email },
    token,
  });
}

module.exports = { register, login };
