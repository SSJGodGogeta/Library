import createEntityRoutes, {routes} from "../routeTools.js";
import {BorrowRecord} from "../../Database/Mapper/Entities/borrow_record.js";

const borrowRecordRoutes = createEntityRoutes<BorrowRecord>(
    {
        getAllFromCacheOrDB: BorrowRecord.getBorrowRecordsFromCacheOrDB,
        getByKey: BorrowRecord.getBorrowRecordsByKey,
    },
    "borrow_record"
);
routes.push({path: "/borrowRecord", router: borrowRecordRoutes});