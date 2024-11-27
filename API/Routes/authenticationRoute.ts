import {Request, Response, Router} from "express";
import bcrypt from 'bcryptjs';
import crypto from "crypto";
import {authenticate} from "../authenticationMiddleware.js";
import {User} from "../../Database/Mapper/Entities/user.js";
import {Session} from "../../Database/Mapper/Entities/session.js";
import {Permission_Techcode} from "../../Database/Mapper/Techcodes/Permission_Techcode.js";
import {sendResponseAsJson} from "./routeTools.js";

const router = Router();

// routes under .../authentication
router.post("/register", register);
router.post("/login", login);
router.get("/currentUser", authenticate, currentUser);
router.post("/logout", authenticate, logout);

async function createNewSession(
    ip: string | undefined,
    user: User,
): Promise<Session> {
    // generate the session and store it in the database
    const session: Session = new Session();

    session.ip = ip ?? 'unknown'; // get the ip of the request
    session.token = crypto.randomBytes(64).toString('hex'); // 128 characters (64 bytes in hex)
    session.created = new Date();
    session.last_used = new Date();
    session.user = user!;

    await session.save();
    return session;
}

function setSessionCookie(
    res: Response,
    token: string
) {
    res.cookie('session_token', token, {
        httpOnly: true, // js cant access the cookie (prevent XSS Attacks)
        secure: true, // Only send over HTTPS
        sameSite: 'strict', // save but will not support cross site workflows like oauth2
        maxAge: 30 * 24 * 60 * 60 * 1000 // Cookie expiry (30 * 24 hours in milliseconds)
    });
}

async function register(req: Request, res: Response)  {
    try {
        // get the email and the password, provided in the body
        let { email, password, first_name, last_name } = req.body;

        // check if the all necessary data was provided
        if (!email) return sendResponseAsJson(res, 406, "email is required");
        if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) return sendResponseAsJson(res, 406, "email has invalid format");
        if (!password) return sendResponseAsJson(res, 406, "password is required");
        if (!first_name) return sendResponseAsJson(res, 406, "first_name is required");
        if (!last_name) return sendResponseAsJson(res, 406, "last_name is required");

        // hash the provided password using the bcrypt.js package
        const hashed_password: string = bcrypt.hashSync(String(password), 10)

        // create the new user
        const user: User = new User();

        user.email = email;
        user.password = hashed_password;
        user.first_name = first_name;
        user.last_name = last_name;
        user.permissions = Permission_Techcode.STUDENT;

        await user.save();

        // generate the session and store it in the database
        const session: Session = await createNewSession(req.ip, user!)

        // Set the token as a secure HttpOnly cookie
        setSessionCookie(res, session.token);

        res.status(200).json({ message: "registering successful" });
        return
    } catch (error) {
        console.error("Error registering in:", error);
        res.status(500).json({message: "Failed to process registering"});
        return;
    }
}

async function login(req: Request, res: Response) {
    try {
        // get the email and the password, provided in the body
        let { email, password } = req.body;

        if (!email) return sendResponseAsJson(res, 406, "email is required");
        if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) return sendResponseAsJson(res, 406, "email has invalid format");
        if (!password) return sendResponseAsJson(res, 406, "password is required");

        // get the user corresponding to the given email
        const user: User | undefined = await User.getUserByKey(
            `email` as keyof User,
            email as User[keyof User],
        );
        if (!user) {
            res.status(401).json({message: "Email or password incorrect"});
            return;
        }

        // hash the given password using the bcrypt.js package and compare it to the stored hash
        if (!bcrypt.compareSync(String(password), user.password)) {
            // uncomment the following line to show what a possible hash would be for a new password
            // console.log(bcrypt.hashSync(String(password), 10))

            res.status(401).json({message: "Email or password incorrect"});
            return;
        }

        // ----------------------------------------------------------------------------------------------------------
        // reaching the following section of the code is only executed when a valid combination of an email and password
        // was provided by the user sending the post request, because otherwise the function would have exited already
        // ----------------------------------------------------------------------------------------------------------

        // generate the session and store it in the database
        const session: Session = await createNewSession(req.ip, user!)

        // Set the token as a secure HttpOnly cookie
        setSessionCookie(res, session.token);

        res.status(200).json({ message: "Login successful" });
        return
    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).json({message: "Failed to process login"});
        return;
    }
}

async function currentUser(req: Request, res: Response) {
    try {
        const users = req.body.user;
        res.status(200).json(users);
    } catch (error) {
        console.error("Error getting current user:", error);
        res.status(500).json({message: "Failed to fetch current user"});
    }
}

async function logout(req: Request, res: Response) {
    try {
        const session: Session = req.body.session;
        if (!session) {
            res.status(404).json({ message: "Session not found" });
            return;
        }
        await session.remove();

        // Clear the cookie from the client
        res.clearCookie("session_token", {
            httpOnly: true,
            secure: false, // Use true if HTTPS in production
            sameSite: "lax",
        });


        res.status(200).json({ message: "Logout successful" });
        return;
    } catch (error) {
        console.error("Error logging out:", error);
        res.status(500).json({message: "Failed to process logout"});
        return;
    }
}

export default router;
