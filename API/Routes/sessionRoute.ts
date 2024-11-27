import createEntityRoutes from "./routeTools.js";
import {Session} from "../../Database/Mapper/Entities/session.js";

const sessionRoutes = createEntityRoutes<Session>(
    {
        getAllFromCacheOrDB: Session.getSessionFromCacheOrDB,
        getByKey: Session.getSessionByKey,
    },
    "book_copy"
);

export default sessionRoutes;