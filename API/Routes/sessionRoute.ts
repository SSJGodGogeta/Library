import createEntityRoutes, {routes} from "../routeTools.js";
import {Session} from "../../Database/Mapper/Entities/session.js";


const sessionRoutes = createEntityRoutes<Session>(
    {
        getAllFromCacheOrDB: Session.getSessionFromCacheOrDB,
        getByKey: Session.getSessionByKey,
    },
    "book_copy"
);
routes.push({path: "/session", router: sessionRoutes});