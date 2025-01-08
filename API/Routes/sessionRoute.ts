import createEntityRoutes, {routes} from "../routeTools.js";
import {Session} from "../../Database/Mapper/Entities/session.js";
import {Request, Response} from "express";
import {User} from "../../Database/Mapper/Entities/user.js";
import {authenticate} from "../authenticationMiddleware.js";
import {sendResponseAsJson} from "./tools/sendResponseAsJson.js";


const sessionRoutes = createEntityRoutes<Session>(
    {
        getAllFromCacheOrDB: Session.getSessionFromCacheOrDB,
        getByKey: Session.getSessionByKey,
    },
    "session"
);

async function getLastSessionOfUser(req: Request, res: Response) {
    if (!req.params.id) return sendResponseAsJson(res, 404, "Couldnt find id in request params.");
    const userId = parseInt(req.params.id);
    const user = await User.getUserByKey("user_id", userId);
    if (!user) sendResponseAsJson(res, 404, `No user found with userId: ${userId}`);
    const session = await Session.getSessionByUserId(userId);
    if (!session) sendResponseAsJson(res, 404, `Session not found for user with userId: ${userId}`);
    return sendResponseAsJson(res, 200, "Found last session:", session);
}

async function updateSessionById(req: Request, res: Response) {
    if (!req.params.id) return sendResponseAsJson(res, 404, "Couldnt find id in request params.");
    const userId = parseInt(req.params.id);
    await updateSession(userId) ? sendResponseAsJson(res, 200, `Updated session for user with ID: ${userId}`) : sendResponseAsJson(res, 404, `Couldnt find session with id ${userId}`);
}

async function updateSession(userId: number) {
    const session = await Session.getSessionByUserId(userId);
    if (!session) return false;
    session.last_used = new Date();
    await Session.saveSession(session);
    return true;
}

sessionRoutes.get("/byUserId/:id", authenticate, getLastSessionOfUser);

sessionRoutes.get("/update/:id", authenticate, updateSessionById);

routes.push({path: "/session", router: sessionRoutes});