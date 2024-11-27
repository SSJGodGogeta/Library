import createEntityRoutes from "./routeTools.js";
import {Book_Copy} from "../../Database/Mapper/Entities/book_copy.js";

const bookCopyRoutes = createEntityRoutes<Book_Copy>(
    {
        getAllFromCacheOrDB: Book_Copy.getBookCopiesFromCacheOrDB,
        getByKey: Book_Copy.getBookCopyByKey,
    },
    "book_copy"
);

export default bookCopyRoutes;