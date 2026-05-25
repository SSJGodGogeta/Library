# Security Lab Report – Lecture 06: Secure Implementation Fundamentals

**Project:** Library Management Web Application  
**Module reviewed:** Authentication (`API/Routes/authenticationRoute.ts`, `API/authenticationMiddleware.ts`), borrow-record API (`API/Routes/borrowRecordRoute.ts`), user entity and API (`Database/Mapper/Entities/user.ts`, `API/Routes/userRoute.ts`)  
**Date:** 2026-05-25

---

## Executive Summary

Four implementation vulnerabilities were identified across the authentication flow and the borrow-record REST API. All have been fixed in this report. The findings span four OWASP Top-10 categories: Broken Authentication, Broken Access Control, Security Misconfiguration, and a Logic Flaw leading to unintended account creation.

---

## Finding 1 – Logic Flaw: `validateCredentials` does not halt caller execution

### Vulnerability class
Logic Flaw / Improper Input Validation (CWE-20)

### Location
`API/Routes/tools/validateCredentials.ts:22-25`  
`API/Routes/authenticationRoute.ts:102` (register) and `:142` (login)

### Description
`validateCredentials` sends a 422 response and returns, but its return value is `void`. Both callers (`register` and `login`) ignore the return value and continue executing, so a failed validation does not actually abort the handler.

**Vulnerable code (before fix):**
```typescript
// validateCredentials.ts
export function validateCredentials(res: Response, email: string, password: string): void {
    if (!email) return sendResponseAsJson(res, 422, "Email is required");
    if (!password) return sendResponseAsJson(res, 422, "Password is required");
    // ^ returns from validateCredentials, not from register/login
}

// authenticationRoute.ts – register()
validateCredentials(res, email, password);   // ← return value ignored
if (!firstName) return ...;
const hashedPassword = bcrypt.hashSync(String(password), 10); // ← runs even if password was missing
await User.saveUser(user);  // ← account created!
```

### Exploit scenario
An attacker sends a registration request with a valid email, first name, last name, but **no password**:

```json
POST /authentication/register
{ "email": "victim@example.com", "firstName": "John", "lastName": "Doe" }
```

Steps:
1. `validateCredentials` sends `422 Password is required` to the client – the attacker sees failure.
2. Execution in `register` continues: `bcrypt.hashSync(String(undefined), 10)` hashes the literal string `"undefined"`.
3. The user account is saved to the database with that hash.
4. `sendResponseAsJson(res, 200, …)` is silently suppressed by `if (!res.headersSent)` – only the 422 reaches the client.
5. The attacker now logs in with `password = "undefined"` and succeeds.

### Fix
Changed `validateCredentials` to return `boolean`; callers now guard with `if (!validateCredentials(…)) return;`.

```typescript
// validateCredentials.ts – after fix
export function validateCredentials(res: Response, email: string, password: string): boolean {
    if (!email) { sendResponseAsJson(res, 422, "Email is required"); return false; }
    if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) { sendResponseAsJson(res, 422, "Email has invalid format"); return false; }
    if (!password) { sendResponseAsJson(res, 422, "Password is required"); return false; }
    return true;
}

// authenticationRoute.ts – register() and login() after fix
if (!validateCredentials(res, email, password)) return;
```

**Files changed:** `API/Routes/tools/validateCredentials.ts`, `API/Routes/authenticationRoute.ts`

---

## Finding 2 – Broken Authentication: Logout does not invalidate the server-side session

### Vulnerability class
Broken Authentication / Insufficient Session Expiration (OWASP A07:2021, CWE-613)

### Location
`API/Routes/authenticationRoute.ts:187-201`

### Description
The `logout` handler only clears the client-side cookie. The session record is **never deleted from the database**. Any captured copy of the `sessionToken` cookie remains valid until the session naturally expires (up to 1 day later).

Additionally, the cookie options used in logout (`secure: false`, `sameSite: "lax"`) were inconsistent with the options used on login (`secure: true`, `sameSite: "strict"`), meaning the cookie was not reliably cleared on the browser.

**Vulnerable code (before fix):**
```typescript
async function logout(_req: Request, res: Response) {
    try {
        res.clearCookie("sessionToken", {
            httpOnly: true,
            secure: false,       // ← should be true; mismatch means cookie may not clear
            sameSite: "lax",     // ← mismatch with how it was set
        });
        return sendResponseAsJson(res, 200, "Success");
        // ← session row in DB is never removed
    }
}
```

### Exploit scenario
1. Attacker steals the victim's `sessionToken` cookie (e.g. via network interception on HTTP, a log leak, or XSS).
2. Victim clicks "Log out" – the frontend clears the cookie locally.
3. Attacker replays the stolen cookie: `Cookie: sessionToken=<stolen>`.
4. The session still exists in the database; `authenticationMiddleware` validates it and the attacker is fully authenticated as the victim for up to 24 hours.

### Fix
Delete the session from the database before clearing the cookie. The `authenticate` middleware already attaches `req.body.session`, so no extra DB lookup is needed.

```typescript
async function logout(req: Request, res: Response) {
    try {
        const session: Session | undefined = req.body.session;
        if (session) await session.remove();          // ← invalidate server-side

        res.clearCookie("sessionToken", {
            httpOnly: true,
            secure: true,         // ← consistent with how it was set
            sameSite: "strict",
        });
        return sendResponseAsJson(res, 200, "Success");
    } catch (error) {
        console.error("Error logging out:", error);
        return sendResponseAsJson(res, 500, "Failed to logout");
    }
}
```

**Files changed:** `API/Routes/authenticationRoute.ts`

---

## Finding 3 – Broken Access Control: IDOR on borrow-record history endpoints

### Vulnerability class
Broken Access Control / Insecure Direct Object Reference (OWASP A01:2021, CWE-639)

### Location
`API/Routes/borrowRecordRoute.ts:20-21` (route definitions)  
`API/Routes/borrowRecordRoute.ts:28-65` (`handleRecords` function)

### Description
Two routes accept a `:userId` URL parameter and return that user's borrow history. The handler checks only that the parameter is a valid integer; it never verifies that the **authenticated user is the owner** of the requested records. Any logged-in user can read another user's full borrowing history by substituting a different ID.

**Vulnerable code (before fix):**
```typescript
router.get("/ActiveRecordsByUserId/:userId", authenticate, (req, res) => handleRecords(req, res, true, true));
router.get("/AllRecordsByUserId/:userId",    authenticate, (req, res) => handleRecords(req, res, false, true));

async function handleRecords(req, res, onlyActive, useParamId) {
    const userId = useParamId ? parseInt(req.params.userId, 10) : req.body.user?.user_id;
    if (!userId) return sendResponseAsJson(res, 400, "Invalid or missing user ID.");
    // ← no check that req.body.user.user_id === userId
    const borrowRecords = await BorrowRecord.getBorrowRecordsFromCacheOrDB();
    const filteredRecords = borrowRecords.filter(record => record.user.user_id === userId ...);
    return sendResponseAsJson(res, 200, "Success", filteredRecords);
}
```

### Exploit scenario
Attacker is logged in as user `42` (a student). They know their own URL pattern is `/borrowRecord/AllRecordsByUserId/42`. They change the parameter:

```
GET /borrowRecord/AllRecordsByUserId/1   → admin's full borrow history
GET /borrowRecord/AllRecordsByUserId/7   → any other user's history
```

This leaks reading habits and personal data for every user in the system.

### Fix
Added an authorization check: the requesting user must either own the records, or hold an elevated permission (EMPLOYEE or ADMIN).

```typescript
async function handleRecords(req: Request, res: Response, onlyActive: boolean, useParamId: boolean) {
    try {
        const requestingUser: User = req.body.user;
        const userId = useParamId ? parseInt(req.params.userId, 10) : requestingUser?.user_id;

        if (!userId) return sendResponseAsJson(res, 400, "Invalid or missing user ID.");

        if (useParamId && requestingUser.user_id !== userId) {
            const elevated = [PermissionTechcode.EMPLOYEE, PermissionTechcode.ADMIN]
                .includes(requestingUser.permissions);
            if (!elevated) return sendResponseAsJson(res, 403, "Access denied.");
        }
        // … rest unchanged
    }
}
```

**Files changed:** `API/Routes/borrowRecordRoute.ts`

---

## Finding 4 – Sensitive Data Exposure: Password hash returned by the User API

### Vulnerability class
Sensitive Data Exposure / Insufficient Data Protection (OWASP A02:2021, CWE-312)

### Location
`API/Routes/userRoute.ts:1-11`  
`API/Routes/routeTools.ts:34-44` (`getAllEntries` / `getSingleEntry`)  
`Database/Mapper/Entities/user.ts`

### Description
The generic CRUD factory in `routeTools.ts` serialises the raw TypeORM entity to JSON and sends it directly. The `User` entity contains a `password` field holding a bcrypt hash. Any authenticated user can therefore call:

```
GET /user          → array of every user including their password hash
GET /user/<id>     → single user including their password hash
```

### Exploit scenario
1. Attacker authenticates as an ordinary student.
2. `GET /user` returns every account's bcrypt hash (e.g. `$2a$10$...`).
3. Attacker loads the hashes into `hashcat` or `john` and runs a dictionary/rule attack.
4. bcrypt with 10 rounds is strong but not immune; weak or reused passwords are recovered in minutes.
5. The attacker logs in with recovered credentials to any account, including admin.

Even without cracking, the hash itself confirms whether two users share the same password (same hash = same password with bcrypt only if the salt happened to be identical, which is unlikely but the hash still constitutes PII).

### Fix
Added a `toJSON()` method to the `User` entity. `JSON.stringify` (and therefore `res.json`) calls `toJSON()` automatically, so no change is needed in the route layer.

```typescript
// Database/Mapper/Entities/user.ts – after fix
toJSON() {
    const { password, ...rest } = this as any;
    return rest;
}
```

This approach is preferred over TypeORM's `select: false` because the `getUserByKey` / `getUsersFromCacheOrDB` helpers are reused during login where the hash *is* needed; stripping at serialisation time keeps those queries working unchanged while ensuring the field never reaches the wire.

**Files changed:** `Database/Mapper/Entities/user.ts`

---

## Summary Table

| # | Severity | OWASP Category | Vulnerability | Status | File(s) |
|---|---|---|---|---|---|
| 1 | **High** | Logic Flaw / Input Validation | `validateCredentials` doesn't halt caller → ghost account creation | Fixed | `validateCredentials.ts`, `authenticationRoute.ts` |
| 2 | **High** | A07 Broken Authentication | Logout doesn't delete server-side session | Fixed | `authenticationRoute.ts` |
| 3 | **High** | A01 Broken Access Control | IDOR: any user reads any other user's borrow history | Fixed | `borrowRecordRoute.ts` |
| 4 | **High** | A02 Sensitive Data Exposure | Password hash included in `/user` API response | Fixed | `user.ts` |

---

## Principle mapping (Lecture 06)

| Principle | Violated by |
|---|---|
| Validate all external input | Finding 1 – validation fires but doesn't stop execution |
| Handle errors without leaking details | Finding 4 – bcrypt hashes sent to the client |
| Configure securely by default | Finding 2 – `secure: false` in logout cookie |
| Fail closed | Finding 1 – registration proceeds even when validation returns failure |
