require("dotenv").config();

const app = require("./app");
const pool = require("./config/db");

const port = process.env.PORT || 4000;

async function start() {
  try {
    await pool.query("SELECT 1");
    app.listen(port, () => {
      console.log(`InterviewFlow API listening on http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Failed to connect to PostgreSQL:", err.message);
    process.exit(1);
  }
}

start();
