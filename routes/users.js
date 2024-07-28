"use strict";

const express = require("express");
const router = express.Router();
const logger = require("../lib/logger");
const { ensureCorrectUserOrAdmin, ensureAdmin } = require("../middleware/auth");
const jsonschema = require("jsonschema");
const userUpdateSchema = require("../schemas/userUpdate.json");
const log = logger();
const User = require("../models/user");

const { BadRequestError } = require("../expressError");

/* GET users listing. */
router.get("/", ensureAdmin, async function (req, res, next) {
  try {
    const users = await User.getAllUsers();
    return res.json({ users });
  } catch (err) {
    return next(err);
  }
});

/* Create a new user */
router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    const { email, firstName, lastName, isAdmin, password, state } = req.body;
    const user = await User.add({
      email,
      firstName,
      lastName,
      isAdmin,
      password,
      state,
    });

    log.info("Created user", user);
    return res.status(201).json({ user });
  } catch (err) {
    return next(err);
  }
});

/* Get a specific user by id */
router.get("/:id", ensureCorrectUserOrAdmin, async function (req, res, next) {
  try {
    const user = await User.getUser(req.params.id);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

/** Set user as active */
router.patch("/activate", ensureAdmin, async function (req, res, next) {
  try {
    const { id } = req.body;
    const user = await User.activate(id);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

/* Delete a user by id */
router.delete(
  "/:id",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      await User.delete(req.params.id);
      log.info("Deleted user", { id: req.params.id });
      return res.status(204).end();
    } catch (err) {
      return next(err);
    }
  }
);

/* Update a user by id */
router.put("/:id", ensureCorrectUserOrAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userUpdateSchema);
    if (!validator.valid) {
      const errors = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errors);
    }
    const user = await User.update(req.params.id, req.body);
    // log.info("Updated user", user);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
