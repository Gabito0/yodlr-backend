const express = require("express");
const router = express.Router();
const logger = require("../lib/logger");
const log = logger();
const { createToken } = require("../helpers/tokens");
const { validate } = require("jsonschema");
const userRegistrationSchema = require("../schemas/userRegister.json");
const User = require("../models/user");
const { BadRequestError } = require("../expressError");

/**
 * Route to authenticate a user and issue a JWT token.
 *
 * This route checks the user's email and password. If valid, it generates a JWT token.
 *
 * @returns {Object} - A JSON object containing the token.
 */
router.post("/token", async function (req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new BadRequestError("Email and password are required");
    }

    // Authenticate the user
    const user = await User.authenticate(email, password);

    // Generate a token
    const token = createToken(user);

    // Return the token
    return res.status(200).json({ token });
  } catch (error) {
    return next(error);
  }
});

/**
 * Route to register a new user.
 *
 * This route creates a new user with the provided email, password, first name, and last name.
 * The state is set to 'pending' and isAdmin is set to false by default.
 *
 * Returns a JWT token for the newly registered user.
 */
router.post("/register", async function (req, res, next) {
  try {
    // Validate the incoming request data
    const validationResult = validate(req.body, userRegistrationSchema);
    if (!validationResult.valid) {
      const errors = validationResult.errors.map((err) => err.stack);
      throw new BadRequestError(`Invalid data: ${errors.join(", ")}`);
    }

    // Extract the data from the request body
    const { email, password, firstName, lastName } = req.body;

    // Default values for state and isAdmin
    const state = "pending";
    const isAdmin = false;

    // Add the new user to the database
    const newUser = await User.add({
      email,
      password,
      firstName,
      lastName,
      isAdmin,
      state,
    });

    // Generate a JWT token for the new user
    const token = createToken(newUser);

    // Return the token
    return res.status(201).json({ token });
  } catch (error) {
    return next(error);
  }
});
module.exports = router;
