// backend/tests/integration/sample.integration.test.js
import request from "supertest";
import app from "../../app.js";

describe("Integration Test - API Root", () => {
  it("should return Home Services API Running", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Home Services API Running ");
  });
});
