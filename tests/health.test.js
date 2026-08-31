process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret";

const request = require("supertest");
const app = require("../src/app");

describe("Health endpoint", () => {
  test("GET /health returns service status", async () => {
    const response = await request(app).get("/health");

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("ok");
    expect(response.body.service).toBe("interviewflow-api");
  });

  test("unknown route returns 404", async () => {
    const response = await request(app).get("/does-not-exist");

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toMatch(/Route not found/);
  });
});
