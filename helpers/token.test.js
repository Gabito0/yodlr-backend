const jwt = require("jsonwebtoken");
const { createToken, SECRET_KEY } = require("./tokens");

describe("createToken", function () {
  test("works: not admin", function () {
    const token = createToken({ id: 1, isAdmin: false });
    const payload = jwt.verify(token, SECRET_KEY);
    expect(payload).toEqual({
      iat: expect.any(Number),
      id: 1,
      isAdmin: false,
    });
  });

  test("works: admin", function () {
    const token = createToken({ id: 1, isAdmin: true });
    const payload = jwt.verify(token, SECRET_KEY);
    expect(payload).toEqual({
      iat: expect.any(Number),
      id: 1,
      isAdmin: true,
    });
  });

  test("works: default no admin", function () {
    const token = createToken({ id: 1 });
    const payload = jwt.verify(token, SECRET_KEY);
    expect(payload).toEqual({
      iat: expect.any(Number),
      id: 1,
      isAdmin: false,
    });
  });
});
