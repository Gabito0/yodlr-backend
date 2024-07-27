"use strict";

const db = require("../db");
const User = require("../models/user");
const { createToken } = require("../helpers/tokens");

async function commonBeforeAll() {
  // Clean out tables and reset IDs to prevent interference from other tests
  await db.query("TRUNCATE users RESTART IDENTITY CASCADE");

  // Add test users with passwords
  await User.add({
    email: "user1@user.com",
    password: "password1",
    firstName: "User1",
    lastName: "Last1",
    isAdmin: false,
    state: "pending",
  });

  await User.add({
    email: "user2@user.com",
    password: "password2",
    firstName: "User2",
    lastName: "Last2",
    isAdmin: false,
    state: "pending",
  });

  await User.add({
    email: "admin@user.com",
    password: "password3",
    firstName: "Admin",
    lastName: "User",
    isAdmin: true,
    state: "active",
  });
}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}

module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
};
