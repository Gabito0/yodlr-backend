"use strict";

const request = require("supertest");
const app = require("../app");
const User = require("../models/user");
const { createToken } = require("../helpers/tokens");
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

// Tokens for testing
let adminToken;
let user1Token;
let user2Token;

beforeEach(async () => {
  const admin = await User.getUser("3");
  const user1 = await User.getUser("1");
  const user2 = await User.getUser("2");

  adminToken = createToken(admin);
  user1Token = createToken(user1);
  user2Token = createToken(user2);
});

/** GET /users */
describe("GET /users", function () {
  test("works for admins: get all users", async function () {
    const resp = await request(app)
      .get("/users")
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body.users.length).toEqual(3);
  });

  test("fails for non-admin users", async function () {
    const resp = await request(app)
      .get("/users")
      .set("authorization", `Bearer ${user1Token}`);
    expect(resp.statusCode).toEqual(403);
  });
});

/** POST /users */
describe("POST /users", function () {
  test("works for creating a new user", async function () {
    const resp = await request(app)
      .post("/users")
      .send({
        email: "newuser@test.com",
        password: "password",
        firstName: "New",
        lastName: "User",
        isAdmin: false,
        state: "active",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      user: {
        email: "newuser@test.com",
        firstName: "New",
        id: 4,
        isAdmin: false,
        lastName: "User",
        state: "active",
      },
    });
  });

  test("fails with duplicate email", async function () {
    const resp = await request(app)
      .post("/users")
      .send({
        email: "user1@user.com",
        password: "password",
        firstName: "Dup",
        lastName: "User",
        isAdmin: false,
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
    expect(resp.body.error.message).toContain("Duplicate email");
  });
});

/** GET /users/:id */
describe("GET /users/:id", function () {
  test("works for getting user by id as admin", async function () {
    const resp = await request(app)
      .get("/users/1")
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body.user).toEqual({
      id: 1,
      email: "user1@user.com",
      firstName: "User1",
      lastName: "Last1",
      isAdmin: false,
      state: "pending",
    });
  });

  test("fails for non-existent user", async function () {
    const resp = await request(app)
      .get("/users/9999")
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
    expect(resp.body.error.message).toContain("No user found");
  });

  test("fails for unauthorized user", async function () {
    const resp = await request(app)
      .get("/users/1")
      .set("authorization", `Bearer ${user2Token}`);
    expect(resp.statusCode).toEqual(403);
  });
});

/** PUT /users/:id */
describe("PUT /users/:id", function () {
  test("works for updating user data", async function () {
    const resp = await request(app)
      .put("/users/1")
      .send({
        firstName: "Updated",
        lastName: "Name",
        email: "user1@user.com",
        currentPassword: "password1",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body.user).toEqual({
      id: 1,
      email: "user1@user.com",
      firstName: "Updated",
      lastName: "Name",
      isAdmin: false,
      state: "pending",
    });
  });

  test("fails with missing required fields", async function () {
    const resp = await request(app)
      .put("/users/1")
      .send({
        email: "not-an-email",
      })
      .set("authorization", `Bearer ${adminToken}`);
    console.log(
      resp.body.error.message,
      "all the messgaes from updating users"
    );
    expect(resp.statusCode).toEqual(400);
    expect(resp.body.error.message).toContain(
      'instance requires property "firstName"'
    );
    expect(resp.body.error.message).toContain(
      'instance requires property "lastName"'
    );
  });
});

/** PUT /users/activate */
describe("PUT /users/activate", function () {
  test("works for activating a user", async function () {
    const resp = await request(app)
      .put("/users/activate")
      .send({ id: 1 })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body.user.state).toEqual("active");
  });

  test("fails for already active user", async function () {
    const resp = await request(app)
      .put("/users/activate")
      .send({ id: 3 })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
    expect(resp.body.error.message).toContain(
      "User with id 3 is already active"
    );
  });
});

/** DELETE /users/:id */
describe("DELETE /users/:id", function () {
  test("works for deleting a user", async function () {
    const resp = await request(app)
      .delete("/users/1")
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(204);
  });

  test("fails for non-existent user", async function () {
    const resp = await request(app)
      .delete("/users/9999")
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
    expect(resp.body.error.message).toContain("No user found");
  });
});
