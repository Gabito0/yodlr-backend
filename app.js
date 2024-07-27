const debug = require("debug")("frontend-code-challenge");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const logger = require("./lib/logger");
const cors = require("cors");
const { NotFoundError } = require("./expressError");

const { authenticateJWT } = require("./middleware/auth");

const users = require("./routes/users");
const auth = require("./routes/auth");

const app = express();
const log = logger(app);

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
app.use(authenticateJWT);

app.use("/users", users);
app.use("/auth", auth);

/** Handle 404 errors -- this matches everything */
app.use(function (req, res, next) {
  return next(new NotFoundError());
});

/*** Generic error handler; anything unhandled goes here. */
app.use(function (err, req, res, next) {
  if (process.env.NODE_ENV !== "test") console.error(err.stack);
  const status = err.status || 500;
  const message = err.message;

  return res.status(status).json({
    error: { message, status },
  });
});

module.exports = app;
