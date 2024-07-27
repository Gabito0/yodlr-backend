"use strict";

const jwt = require("jsonwebtoken");
const {
  authenticateJWT,
  ensureAdmin,
  ensureCorrectUserOrAdmin,
} = require("./auth");

const { SECRET_KEY } = require("../helpers/tokens");
const testJwt = jwt.sign({ id: 1, isAdmin: false }, SECRET_KEY);
const badJwt = jwt.sign({ id: 2, isAdmin: false }, "wrong");

describe("authenticateJWT", function () {
  test("works: via header", function () {
    expect.assertions(2);
    //there are multiple ways to pass an authorization token, this is how you pass it in the header.
    //this has been provided to show you another way to pass the token. you are only expected to read this code for this project.
    const req = { headers: { authorization: `Bearer ${testJwt}` } };
    const res = { locals: {} };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({
      user: {
        iat: expect.any(Number),
        id: 1,
        isAdmin: false,
      },
    });
  });

  test("works: no header", function () {
    expect.assertions(2);
    const req = {};
    const res = { locals: {} };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });

  test("works: invalid token", function () {
    expect.assertions(2);
    const req = { headers: { authorization: `Bearer ${badJwt}` } };
    const res = { locals: {} };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });
});

describe("ensureAdmin", function () {
  test("works", function () {
    expect.assertions(1);
    const req = {};
    const res = { locals: { user: { id: 1, isAdmin: true } } };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    ensureAdmin(req, res, next);
  });

  test("unauth if not admin", function () {
    expect.assertions(1);
    const req = {};
    const res = { locals: { user: { username: "test", isAdmin: false } } };
    const next = function (err) {
      expect(err).toBeTruthy();
    };
    ensureAdmin(req, res, next);
  });

  test("unauth if anon", function () {
    expect.assertions(1);
    const req = {};
    const res = { locals: {} };
    const next = function (err) {
      expect(err).toBeTruthy();
    };
    ensureAdmin(req, res, next);
  });
});

describe("ensureCorrectUserOrAdmin", function () {
  test("works: admin", function () {
    expect.assertions(1);
    const req = { params: { id: 2 } };
    const res = { locals: { user: { test: 2, isAdmin: true } } };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    ensureCorrectUserOrAdmin(req, res, next);
  });

  test("works: same user", function () {
    expect.assertions(1);
    const req = { params: { id: 1 } };
    const res = { locals: { user: { id: 1, isAdmin: false } } };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    ensureCorrectUserOrAdmin(req, res, next);
  });

  test("unauth: mismatch", function () {
    expect.assertions(1);
    const req = { params: { id: 3 } };
    const res = { locals: { user: { id: 1, isAdmin: false } } };
    const next = function (err) {
      expect(err).toBeTruthy();
    };
    ensureCorrectUserOrAdmin(req, res, next);
  });

  test("unauth: if anon", function () {
    expect.assertions(1);
    const req = { params: { id: 4 } };
    const res = { locals: {} };
    const next = function (err) {
      expect(err).toBeTruthy();
    };
    ensureCorrectUserOrAdmin(req, res, next);
  });
});
