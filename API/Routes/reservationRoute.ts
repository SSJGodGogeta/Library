import createEntityRoutes from "./routeTools.js";
import {Reservation} from "../../Database/Mapper/Entities/reservation.js";

const reservationRoutes = createEntityRoutes<Reservation>(
    {
        getAllFromCacheOrDB: Reservation.getReservationFromCacheOrDB,
        getByKey: Reservation.getReservationsByKey,
    },
    "reservation"
);

export default reservationRoutes;