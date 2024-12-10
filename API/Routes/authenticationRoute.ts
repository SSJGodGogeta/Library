import {Request, Response, Router} from "express";
import bcrypt from 'bcryptjs';
import crypto from "crypto";
import {UAParser} from 'ua-parser-js';
import {authenticate} from "../authenticationMiddleware.js";
import {User} from "../../Database/Mapper/Entities/user.js";
import {Session} from "../../Database/Mapper/Entities/session.js";
import {PermissionTechcode} from "../../Database/Mapper/Techcodes/PermissionTechcode.js";
import {routes, sendResponseAsJson} from "../routeTools.js";

const router = Router();

// routes under .../authentication
router.post("/register", register);
router.post("/login", login);
router.get("/currentUser", authenticate, currentUser);
router.post("/logout", authenticate, logout);

/**
 * Determines if a session is expired based on its creation date and the expiration period in days.
 *
 * @param {Date} createdAt - The date when the session was created.
 * @param {number} days - The number of days the session is valid.
 * @returns {boolean} `true` if the session is expired, otherwise `false`.
 *
 * @example
 * // Example usage
 * const createdAt = new Date('2024-12-01T10:00:00'); // Session created on December 1, 2024,
 * const expirationDays = 7;
 *
 * const expired = isSessionExpired(createdAt, expirationDays);
 * console.log(expired); // Output: true or false depending on the current date
 */
export function isSessionExpired(createdAt: Date, days: number): boolean {
    const now = Date.now(); // Current timestamp in milliseconds
    const expirationTime = createdAt.getTime() + days * 24 * 60 * 60 * 1000; // Add days in milliseconds
    return now > expirationTime;
}

/**
 * Creates a new session for a user or updates an existing session if it matches the device and IP.
 *
 * @async
 * @function createNewSession
 * @param {Request} req - The HTTP request object containing headers and IP address.
 * @param {User} user - The user object for whom the session is being created or updated.
 * @returns {Promise<Session>} A promise that resolves to the created or updated session object.
 *
 * @description
 * - Checks if there is an active session for the user.
 * - If an active session exists and matches the current device and IP,
 *   checks if the session is expired:
 *   - If not expired, updates the `last_used` timestamp and returns the session.
 *   - If expired, removes the old session and creates a new one.
 * - If no active session exists, creates a new session and stores it in the database.
 *
 * @throws {Error} If there is an issue saving the session to the database.
 */
async function createNewSession(req: Request, user: User): Promise<Session> {
    // get user, user agent and check if it's the same as the one stored in the db.
    const userAgent = req.headers['user-agent'] || 'unknown';
    const {ua} = UAParser(userAgent);
    const ip: string | undefined = req.ip;
    const activeSession: Session | null = await Session.getSessionByUserId(user.user_id);
    // if session exists:
    if (activeSession && activeSession.deviceInfo == ua && activeSession.ip == ip) {
        if (!isSessionExpired(activeSession.last_used, 1)) {
            activeSession.last_used = new Date();
            await Session.saveSession(activeSession);
            console.warn("User has already an active session.");
            return activeSession;
        }
        await activeSession.remove();
        await Session.saveSession(activeSession);
    }
    // if it doesn't exist:
    // generate the session and store it in the database
    const session: Session = new Session();
    session.deviceInfo = ua;
    session.ip = ip ?? 'unknown'; // get the ip of the request
    session.token = crypto.randomBytes(64).toString('hex'); // 128 characters (64 bytes in hex)
    session.created = new Date();
    session.last_used = new Date();
    session.user = user!;

    await Session.saveSession(session);
    return session;

}

/**
 * Sets a secure session cookie in the HTTP response.
 *
 * @function setSessionCookie
 * @param {Response} res - The HTTP response object to which the cookie will be added.
 * @param {string} token - The session token to be stored in the cookie.
 *
 * @description
 * - Configures the cookie with the following properties:
 *   - `httpOnly`: Prevents JavaScript access to the cookie to mitigate XSS attacks.
 *   - `secure`: Ensures the cookie is sent only over HTTPS connections.
 *   - `sameSite`: Restricts the cookie to the same site to enhance security
 *     (set to `strict` which may block cross-site workflows like OAuth2).
 *   - `maxAge`: Sets the cookie's expiry time to 30 days.
 */
function setSessionCookie(res: Response, token: string) {
    res.cookie('sessionToken', token, {
        httpOnly: true, // js cant access the cookie (prevent XSS Attacks)
        secure: true, // Only send over HTTPS
        sameSite: 'strict', // save but will not support cross site workflows like oauth2
        maxAge: 30 * 24 * 60 * 60 * 1000 // Cookie expiry (30 * 24 hours in milliseconds)
    });
}

/**
 * Validates user credentials and sends appropriate error responses if validation fails.
 *
 * @function validateCredentials
 * @param {Response} res - The HTTP response object used to send validation error messages.
 * @param {string} email - The email address to validate.
 * @param {string} password - The password to validate.
 *
 * @description
 * - Checks if the email is provided and follows a valid format:
 *   - If not provided, sends a 422 response with an "Email is required" message.
 *   - If invalid, sends a 422 response with an "Email has invalid format" message.
 * - Checks if the password is provided:
 *   - If not provided, sends a 422 response with a "Password is required" message.
 *
 * @returns {void} This function sends a response directly and does not return a value.
 */
function validateCredentials(res: Response, email: string, password: string): void {
    if (!email) return sendResponseAsJson(res, 422, "Email is required");
    if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) return sendResponseAsJson(res, 422, "Email has invalid format");
    if (!password) return sendResponseAsJson(res, 422, "Password is required");
}

async function register(req: Request, res: Response) {
    try {
        // get the email and the password, provided in the body
        let {email, password, firstName, lastName} = req.body;
        // check if the all necessary data was provided
        validateCredentials(res, email, password);
        if (!firstName) return sendResponseAsJson(res, 422, "First name is required");
        if (!lastName) return sendResponseAsJson(res, 422, "Last name is required");

        // hash the provided password using the bcrypt.js package
        const hashedPassword: string = bcrypt.hashSync(String(password), 10)

        const userAlreadyExists = await User.getUserByKey("email", email);
        if (userAlreadyExists) {
            return sendResponseAsJson(res, 409, "User already exists! Please login");
        }
        // create the new user
        const user: User = new User();

        user.email = email;
        user.password = hashedPassword;
        user.first_name = firstName;
        user.last_name = lastName;
        user.permissions = PermissionTechcode.STUDENT;

        await User.saveUser(user);
        // generate the session and store it in the database
        const session: Session = await createNewSession(req, user!)
        // Set the token as a secure HttpOnly cookie
        setSessionCookie(res, session.token);

        return sendResponseAsJson(res, 200, "Success");
    } catch (error) {
        console.error("Error registering in:", error);
        return sendResponseAsJson(res, 500, "Failed to process registration");
    }
}

async function login(req: Request, res: Response) {
    try {
        console.log('Processing login');

        // get the email and the password, provided in the body
        let {email, password} = req.body;

        validateCredentials(res, email, password);

        // get the user corresponding to the given email
        const user: User | undefined = await User.getUserByKey(`email`, email);
        if (!user) {
            console.error("No user found");
            return sendResponseAsJson(res, 404, "User not found. Please register");
        }
        // hash the given password using the bcrypt.js package and compare it to the stored hash
        if (!bcrypt.compareSync(String(password), user!.password)) {
            // uncomment the following line to show what a possible hash would be for a new password
            // console.log(bcrypt.hashSync(String(password), 10))

            console.error("Password incorrect");
            return sendResponseAsJson(res, 401, "Email or password incorrect");
        }

        // ----------------------------------------------------------------------------------------------------------
        // reaching the following section of the code is only executed when a valid combination of an email and password
        // was provided by the user sending the post request, because otherwise the function would have exited already
        // ----------------------------------------------------------------------------------------------------------

        // generate the session and store it in the database
        const session: Session = await createNewSession(req, user!)
        // Set the token as a secure HttpOnly cookie
        setSessionCookie(res, session.token);

        return sendResponseAsJson(res, 200, "Success");
    } catch (error) {
        console.error("Error logging in:", error);
        return sendResponseAsJson(res, 500, "Failed to process login");
    }
}

async function currentUser(req: Request, res: Response) {
    try {
        return sendResponseAsJson(res, 200, "Success", req.body.user);
    } catch (error) {
        console.error("Error getting current user:", error);
        return sendResponseAsJson(res, 500, "Failed to fetch current user");
    }
}

async function logout(req: Request, res: Response) {
    try {
        // the session is guaranteed to exist at this point. Otherwise, the authenticationMiddleware would have thrown an error
        const session: Session = req.body.session;
        await session.remove();

        // Clear the cookie from the client
        res.clearCookie("sessionToken", {
            httpOnly: true,
            secure: false, // Use true if HTTPS in production
            sameSite: "lax",
        });

        return sendResponseAsJson(res, 200, "Success");
    } catch (error) {
        console.error("Error logging out:", error);
        return sendResponseAsJson(res, 500, "Failed to logout");
    }
}

routes.push({path: "/authentication", router: router});