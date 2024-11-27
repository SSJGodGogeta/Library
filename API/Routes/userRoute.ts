import {User} from "../../Database/Mapper/Entities/user.js";
import createEntityRoutes from "./routeTools.js";

const userRoutes = createEntityRoutes<User>(
    {
        getAllFromCacheOrDB: User.getUsersFromCacheOrDB,
        getByKey: User.getUserByKey,
    },
    "user"
);

export default userRoutes;