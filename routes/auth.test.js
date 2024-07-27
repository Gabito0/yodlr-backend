"use strict";

const request = require("supertest");
const app = require("../app");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("POST /token", function () {
  test("works: valid credentials", async function () {
    const resp = await request(app).post("/auth/token").send({
      email: "user1@user.com",
      password: "password1",
    });
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      token: expect.any(String),
    });
  });

  test("fails: missing email", async function () {
    const resp = await request(app).post("/auth/token").send({
      password: "password1",
    });
    expect(resp.statusCode).toEqual(400);
    expect(resp.body.error.message).toEqual("Email and password are required");
  });

  test("fails: missing password", async function () {
    const resp = await request(app).post("/auth/token").send({
      email: "user1@user.com",
    });
    expect(resp.statusCode).toEqual(400);
    expect(resp.body.error.message).toEqual("Email and password are required");
  });

  test("fails: invalid credentials", async function () {
    const resp = await request(app).post("/auth/token").send({
      email: "user1@user.com",
      password: "wrongpassword",
    });
    expect(resp.statusCode).toEqual(401);
    expect(resp.body.error.message).toEqual("Invalid email/password");
  });

  test("fails: non-existent user", async function () {
    const resp = await request(app).post("/auth/token").send({
      email: "nonexistent@user.com",
      password: "password",
    });
    expect(resp.statusCode).toEqual(401);
    expect(resp.body.error.message).toEqual("Invalid email/password");
  });
});
