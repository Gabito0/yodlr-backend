"use strict";

const db = require("../db");
const User = require("./user");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");
const { NotFoundError, BadRequestError } = require("../expressError");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** add */

describe("add", function () {
  test("works: add new user", async function () {
    let user = await User.add({
      email: "newuser@test.com",
      password: "password",
      firstName: "New",
      lastName: "User",
      isAdmin: false,
      state: "pending",
    });
    expect(user).toEqual({
      id: expect.any(Number),
      email: "newuser@test.com",
      firstName: "New",
      lastName: "User",
      isAdmin: false,
      state: "pending",
    });
  });

  test("fails: duplicate email", async function () {
    try {
      await User.add({
        email: "user1@user.com",
        password: "password",
        firstName: "User1",
        lastName: "Dup",
        isAdmin: false,
        state: "pending",
      });
      fail(); // Shouldn't reach here
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** getAllUsers */

describe("getAllUsers", function () {
  test("works: retrieves all users", async function () {
    let users = await User.getAllUsers();
    expect(users).toEqual([
      {
        id: expect.any(Number),
        email: "user1@user.com",
        firstName: "User1",
        lastName: "Last1",
        isAdmin: false,
        state: "pending",
      },
      {
        id: expect.any(Number),
        email: "user2@user.com",
        firstName: "User2",
        lastName: "Last2",
        isAdmin: false,
        state: "pending",
      },
      {
        id: expect.any(Number),
        email: "admin@user.com",
        firstName: "Admin",
        lastName: "User",
        isAdmin: true,
        state: "active",
      },
    ]);
  });
});

/************************************** getUser */

describe("getUser", function () {
  test("works: retrieves user by ID", async function () {
    let user = await User.getUser(1);
    expect(user).toEqual({
      id: 1,
      email: "user1@user.com",
      firstName: "User1",
      lastName: "Last1",
      isAdmin: false,
      state: "pending",
    });
  });

  test("not found if no such user", async function () {
    try {
      await User.getUser(9999); // Non-existent ID
      fail(); // Shouldn't reach here
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  test("works: updates user data", async function () {
    let user = await User.update(1, {
      firstName: "Updated",
      email: "user1@user.com",
      firstName: "Updated",
      lastName: "Last1",
      state: "pending",
      currentPassword: "password1",
    });
    expect(user).toEqual({
      id: 1,
      email: "user1@user.com",
      firstName: "Updated",
      lastName: "Last1",
      isAdmin: false,
      state: "pending",
    });
  });

  test("not found if no such user", async function () {
    try {
      await User.update(9999, { firstName: "Updated" }); // Non-existent ID
      fail(); // Shouldn't reach here
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** activate */

describe("activate", function () {
  test("works: activates user", async function () {
    let user = await User.activate(1);
    expect(user).toEqual({
      id: 1,
      email: "user1@user.com",
      firstName: "User1",
      lastName: "Last1",
      isAdmin: false,
      state: "active",
    });
  });

  test("bad request if already active", async function () {
    try {
      await User.activate(3);
      fail(); // Shouldn't reach here
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });

  test("not found if no such user", async function () {
    try {
      await User.activate(9999); // Non-existent ID
      fail(); // Shouldn't reach here
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
