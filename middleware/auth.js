"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers && req.headers.authorization;
    console.log(authHeader, "this is the header");
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      console.log(token, "this is the token");
      console.log(SECRET_KEY, "this is the secret key");
      res.locals.user = jwt.verify(token, SECRET_KEY);
      console.log(res.locals.user);
    }
    return next();
  } catch (err) {
    return next();
  }
}

/** Middleware to use when they be logged in as an admin user.
 *
 *  If not, raises Unauthorized.
 */

function ensureAdmin(req, res, next) {
  try {
    if (!res.locals.user || !res.locals.user.isAdmin) {
      const err = new Error("Unauthorized");
      err.status = 403;
      return next(err);
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

function ensureCorrectUserOrAdmin(req, res, next) {
  try {
    const user = res.locals.user;
    if (!(user && (user.isAdmin || user.id === +req.params.id))) {
      const err = new Error("Unauthorized");
      err.status = 403;
      return next(err);
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = { authenticateJWT, ensureCorrectUserOrAdmin, ensureAdmin };
