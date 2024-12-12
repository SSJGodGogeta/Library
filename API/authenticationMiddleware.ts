import {NextFunction, Request, Response} from "express";
import {Session} from "../Database/Mapper/Entities/session.js";
import {isSessionExpired} from "./Routes/tools/isSessionExpired.js";
import {getDifferenceInMinutes} from "./Routes/tools/getDifferenceInMinutes.js"
import {sendResponseAsJson} from "./Routes/tools/sendResponseAsJson.js";

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Retrieve the session token from the cookies send with the request
        const token = req.cookies.sessionToken;
        if (!token) {
            return sendResponseAsJson(res, 422, "No session token provided");
        }

        // get the session, the given token belongs to
        const session: Session | undefined = await Session.getSessionByKey("token", token);
        if (!session) {
            return sendResponseAsJson(res, 401, "Session not found");
        }
        if (isSessionExpired(session.last_used, new Date(), 1)) {
            await session.remove();
            await Session.saveSession(session);
            return sendResponseAsJson(res, 401, "Session expired");
        }
        /*
        check if the ip of the session has changed
        this can happen, when you have no static IP and your public IP changes
        this can also happen on mobile devices when switching from wi-fi to mobile data
         */
        let change: boolean = false;
        if (req.ip && session!.ip !== req.ip) {
            // update the ip address assigned to the session
            session!.ip = req.ip;
            change = true;
        }
        if (getDifferenceInMinutes(session.last_used, new Date()) > 5) {
            session.last_used = new Date();
            change = true;
        }
        if (change) await Session.saveSession(session);
        console.log(`Authenticated User: ${session!.user.first_name} ${session!.user.last_name} with Email ${session!.user.email}`);

        // Attach user and session info to request for further processing in the following routes
        req.body.session = session!;
        req.body.user = session!.user;

        next(); // Proceed to the next route handler
    } catch (error) {
        console.error("Authentication error:", error);
        return sendResponseAsJson(res, 500, "Failed to authenticate with token");
    }
};