import {NextFunction, Request, Response} from "express";
import {Session} from "../Database/Mapper/Entities/session";

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Retrieve the session token from the cookies send with the request
        const token = req.cookies.session_token;
        if (!token) {
            res.status(406).json({message: "no session token provided"});
            return;
        }

        // get the session, the given token belongs to
        const session: Session | null = await Session.findOne({
            where: { token: token },
            relations: { user: true }
        });
        if (!session) {
            res.status(404).json({message: "session not found"});
        }

        /*
        check if the ip of the session has changed
        this can happen, when you have no static IP and your public IP changes
        this can also happen on mobile devices when switching from wi-fi to mobile data
         */
        if (req.ip && session!.ip !== req.ip) {
            // update the ip address assigned to the session
            session!.ip = req.ip;
            await session!.save();
        }

        console.log(`Authenticated User: ${session!.user.first_name} ${session!.user.last_name} with Email ${session!.user.email}`);

        // Attach user and session info to request for further processing in the following routes
        req.body.session = session!;
        req.body.user = session!.user;

        next(); // Proceed to the next route handler
    } catch (error) {
        console.error("Authentication error:", error);
        res.status(500).json({message: "Failed to authenticate token"});
    }
};