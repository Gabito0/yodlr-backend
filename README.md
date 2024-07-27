# Yodlr Backend

---

**Yodlr backend** is an API designed to manage data flow for both users and administrators.

**Tech Stack**

- PostgreSQL - Datebase
- Express JS - Web Framework

---

### Get started

Clone repo:
`git clone https://github.com/Gabito0/yodlr-backend.git`

Install dependencies:
`npm i`

Run server:
`npm run dev`

### Routes

---

##### Auth Routes

Auth routes handles users' being authenticated by using their crendetials or registering for the first time.

- Request a token - Send user's credentials, in return for a token if valid credentials.

  - method: `post`
  - `BASE_URL/auth/token`
  - Required data: `{email, password}`
  - returns: `{token}`

- Register for a token - Registers a new user, in return sends a token.
- - method: `post`
  - `BASE_URL/auth/register`
  - Required data: `{email, password, firstName, lastName}`
  - returns: `{token}`

---

##### User Routes

User Routes handles updating user's information, admins creating a new user with admins perks, deleting a user, activating a user, and gettting all user's information.

- Get all users - Gets every single user's information.

  - method: `get`
  - authorized: _admin_
  - `BASE_URL/users`
  - returns `{users}`

- Create user - Creates a new user with admin perks.

  - method: `post`
  - authorized: _admin_
  - required data: `{email, password, firstName, lastName, isAdmin, state}`
  - `BASE_URL/users`
  - returns `{user}`

- Get user - Get user's information by thier id.

  - method: `get`
  - authorized: _user or admin_
  - `BASE_URL/users/:id`
  - returns: `{user}`

- Activate user - Changes user's `state` to `active`

  - method:`patch`
  - authorized: _admin_
  - `BASE_URL/users/activate`
  - required date: `{id}`
  - returns: `{user}`

- Update user's information - Updates user's information

  - method:`put`
  - authorized: _user or admin_
  - `BASE_URL/users/:id`
  - required data: `{email, currentPassword, firstName, lastName, state}`
  - optional data: `{newPassword}`
  - returns: `{user}`

- Delete user - Deletes a user from the database
  - method: `delete`
  - authorized: _user or admin_
  - `BASE_URL/users/:id`
  - returns: `undefined`

---

#### Testing

To run test:
`npm run test`
