import {Request, Response, Router} from "express";
import bcrypt from 'bcryptjs';
import crypto from "crypto";
import {UAParser} from 'ua-parser-js';
import {authenticate} from "../authenticationMiddleware.js";
import {User} from "../../Database/Mapper/Entities/user.js";
import {Session} from "../../Database/Mapper/Entities/session.js";
import {Permission_Techcode} from "../../Database/Mapper/Techcodes/Permission_Techcode.js";
import {routes, sendResponseAsJson} from "../routeTools.js";

const router = Router();

// routes under .../authentication
router.post("/register", register);
router.post("/login", login);
router.get("/currentUser", authenticate, currentUser);
router.post("/logout", authenticate, logout);

async function createNewSession(req: Request, user: User): Promise<Session> {
    // get user, user agent and check if its the same as the one stored in the db.
    const userAgent = req.headers['user-agent'] || 'unknown';
    const {ua} = UAParser(userAgent);
    const ip: string | undefined = req.ip;
    const activeSession: Session | null = await Session.getSessionByUserId(user.user_id);
    if (activeSession && activeSession.deviceInfo == ua && activeSession.ip == ip) {
        activeSession.last_used = new Date();
        await activeSession.save();
        console.warn("User has already an active session.");
        return activeSession;
    }
    // generate the session and store it in the database
    const session: Session = new Session();
    session.deviceInfo = ua;
    session.ip = ip ?? 'unknown'; // get the ip of the request
    session.token = crypto.randomBytes(64).toString('hex'); // 128 characters (64 bytes in hex)
    session.created = new Date();
    session.last_used = new Date();
    session.user = user!;

    await session.save();
    return session;
}

function setSessionCookie(res: Response, token: string) {
    res.cookie('session_token', token, {
        httpOnly: true, // js cant access the cookie (prevent XSS Attacks)
        secure: true, // Only send over HTTPS
        sameSite: 'strict', // save but will not support cross site workflows like oauth2
        maxAge: 30 * 24 * 60 * 60 * 1000 // Cookie expiry (30 * 24 hours in milliseconds)
    });
}

async function register(req: Request, res: Response) {
    try {
        // get the email and the password, provided in the body
        let {email, password, first_name, last_name} = req.body;

        // check if the all necessary data was provided
        if (!email) return sendResponseAsJson(res, 422, "email is required");
        if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) return sendResponseAsJson(res, 422, "email has invalid format");
        if (!password) return sendResponseAsJson(res, 422, "password is required");
        if (!first_name) return sendResponseAsJson(res, 422, "first_name is required");
        if (!last_name) return sendResponseAsJson(res, 422, "last_name is required");

        // hash the provided password using the bcrypt.js package
        const hashed_password: string = bcrypt.hashSync(String(password), 10)

        const userAlreadyExists = await User.getUserByKey("email", email);
        if (userAlreadyExists) {
            return sendResponseAsJson(res, 409, "User already exists! Please login");
        }
        // create the new user
        const user: User = new User();

        user.email = email;
        user.password = hashed_password;
        user.first_name = first_name;
        user.last_name = last_name;
        user.permissions = Permission_Techcode.STUDENT;

        await user.save();

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

        if (!email) return sendResponseAsJson(res, 422, "Email is required");
        if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) return sendResponseAsJson(res, 422, "Email has invalid format");
        if (!password) return sendResponseAsJson(res, 422, "Password is required");

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
        const user = req.body.user;
        return sendResponseAsJson(res, 200, "Success", user);
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
        res.clearCookie("session_token", {
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