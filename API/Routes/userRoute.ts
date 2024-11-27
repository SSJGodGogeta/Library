import {User} from "../../Database/Mapper/Entities/user.js";
import createEntityRoutes, {routes} from "../routeTools.js";

const userRoutes = createEntityRoutes<User>(
    {
        getAllFromCacheOrDB: User.getUsersFromCacheOrDB,
        getByKey: User.getUserByKey,
    },
    "user"
);
routes.push({path: "/user", router: userRoutes});