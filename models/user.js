"use strict";

const db = require("../db");
const { sqlForPartialUpdate } = require("../helpers/sql");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config");

/** Related functions for users. */

class User {
  /**
   * Authenticate a user by email and password.
   *
   * @param {string} email - The email of the user.
   * @param {string} password - The password of the user.
   * @returns {Object} The authenticated user's data excluding the password.
   * @throws {UnauthorizedError} If the email or password is incorrect.
   */
  static async authenticate(email, password) {
    // Retrieve user data based on email
    const result = await db.query(
      `SELECT id, email, password, first_name AS "firstName", last_name AS "lastName", is_admin AS "isAdmin", state
       FROM users
       WHERE email = $1`,
      [email]
    );

    const user = result.rows[0];

    if (!user) {
      throw new UnauthorizedError("Invalid email/password");
    }

    // Compare the provided password with the stored hashed password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new UnauthorizedError("Invalid email/password");
    }

    // Return user data, excluding the password
    delete user.password;
    return user;
  }

  /**
   * Add a new user to the database.
   *
   * @param {Object} userDetails - The details of the user to add.
   * @param {string} userDetails.email - The email of the user.
   * @param {string} userDetails.password - The password of the user.
   * @param {string} userDetails.firstName - The first name of the user.
   * @param {string} userDetails.lastName - The last name of the user.
   * @param {boolean} userDetails.isAdmin - Whether the user is an admin.
   * @param {string} userDetails.state - The state of the user.
   *
   * @returns {Object} The new user's data.
   * @throws {BadRequestError} If the user already exists or input is invalid.
   */
  static async add({ email, password, firstName, lastName, isAdmin, state }) {
    // Check if user already exists
    const duplicateCheck = await db.query(
      `SELECT email
         FROM users
         WHERE email = $1`,
      [email]
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate email: ${email}`);
    }

    // Hash the password before storing it in the database
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    // Insert new user into the database
    const result = await db.query(
      `INSERT INTO users (email, password, first_name, last_name, is_admin, state)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, email, first_name AS "firstName", last_name AS "lastName", is_admin AS "isAdmin", state`,
      [email, hashedPassword, firstName, lastName, isAdmin, state]
    );

    const user = result.rows[0];

    return user;
  }

  /**
   * Get all users from the database.
   *
   * @returns {Array} List of all users.
   */
  static async getAllUsers() {
    const result = await db.query(
      `SELECT id, email, first_name AS "firstName", last_name AS "lastName", is_admin AS "isAdmin", state
       FROM users`
    );

    return result.rows;
  }

  /**
   * Get a user by ID from the database.
   *
   * @param {number} id - The ID of the user to retrieve.
   * @returns {Object} The user's data.
   * @throws {NotFoundError} If the user is not found.
   */
  static async getUser(id) {
    const result = await db.query(
      `SELECT id, email, first_name AS "firstName", last_name AS "lastName", is_admin AS "isAdmin", state
       FROM users
       WHERE id = $1`,
      [id]
    );

    const user = result.rows[0];

    if (!user) {
      throw new NotFoundError(`No user found with id: ${id}`);
    }

    return user;
  }

  /**
   * Delete a user by ID from the database.
   *
   * @param {number} id - The ID of the user to delete.
   * @returns {void}
   * @throws {NotFoundError} If the user is not found.
   */
  static async delete(id) {
    const result = await db.query(
      `DELETE
       FROM users
       WHERE id = $1
       RETURNING id`,
      [id]
    );

    const user = result.rows[0];

    if (!user) {
      throw new NotFoundError(`No user found with id: ${id}`);
    }
  }

  /**
   * Update user data.
   *
   * @param {number} id - The ID of the user to update.
   * @param {Object} data - The data to update for the user. Can include: { email, firstName, lastName, state, currentPassword, newPassword }.
   * @returns {Object} - The updated user object.
   * @throws {NotFoundError} - If no user is found with the given id.
   * @throws {UnauthorizedError} - If the provided current password is incorrect.
   */
  static async update(id, data) {
    const { currentPassword, newPassword, ...fieldsToUpdate } = data;

    // If updating the password, check if the current password matches
    if (currentPassword && newPassword) {
      const userRes = await db.query(
        `SELECT password FROM users WHERE id = $1`,
        [id]
      );

      const user = userRes.rows[0];

      if (!user) throw new NotFoundError(`No user found with id: ${id}`);

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) throw new UnauthorizedError("Incorrect password");

      // If passwords match, hash the new password and add it to fields to update
      fieldsToUpdate.password = await bcrypt.hash(
        newPassword,
        BCRYPT_WORK_FACTOR
      );
    }
    const userRes = await db.query(`SELECT password FROM users WHERE id = $1`, [
      id,
    ]);
    const userPass = userRes.rows[0];
    if (!userPass) throw new NotFoundError(`No user found with id: ${id}`);

    const isMatch = await bcrypt.compare(currentPassword, userPass.password);
    if (!isMatch) throw new UnauthorizedError("Incorrect password");

    const { setCols, values } = sqlForPartialUpdate(fieldsToUpdate, {
      firstName: "first_name",
      lastName: "last_name",
      email: "email",
      state: "state",
      password: "password",
    });

    const idVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE users 
                      SET ${setCols} 
                      WHERE id = ${idVarIdx} 
                      RETURNING id, email, first_name AS "firstName", last_name AS "lastName", is_admin AS "isAdmin", state`;
    const result = await db.query(querySql, [...values, id]);
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user with id: ${id}`);

    return user;
  }

  /**
   * Activate a user by changing their state to 'active'.
   *
   * @param {number} id - The ID of the user to activate.
   * @returns {Object} The updated user's data.
   * @throws {NotFoundError} If the user is not found.
   * @throws {BadRequestError} If the user's state is already active.
   */
  static async activate(id) {
    // Check if the user exists and their current state
    const checkResult = await db.query(
      `SELECT id, state
       FROM users
       WHERE id = $1`,
      [id]
    );

    const user = checkResult.rows[0];

    if (!user) {
      throw new NotFoundError(`No user found with id: ${id}`);
    }

    if (user.state === "active") {
      throw new BadRequestError(`User with id ${id} is already active.`);
    }

    // Update the user's state to 'active'
    const result = await db.query(
      `UPDATE users
       SET state = 'active'
       WHERE id = $1
       RETURNING id, email, first_name AS "firstName", last_name AS "lastName", is_admin AS "isAdmin", state`,
      [id]
    );

    return result.rows[0];
  }
}

module.exports = User;
