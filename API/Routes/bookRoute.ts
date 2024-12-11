import createEntityRoutes, {routes} from "../routeTools.js";
import {Book} from "../../Database/Mapper/Entities/book.js";
import {authenticate} from "../authenticationMiddleware.js";
import {Request, Response} from "express";
import {sendResponseAsJson} from "./tools/sendResponseAsJson.js";


const bookRoutes = createEntityRoutes<Book>(
    {
        getAllFromCacheOrDB: Book.getBooksFromCacheOrDB,
        getByKey: Book.getBookByKey,
    },
    "book",
    { authenticate: false }
);
// you can add new routes like this:
// Add another GET route
bookRoutes.get("/author/:author", authenticate, getBooksByAuthor);

async function getBooksByAuthor(req: Request, res: Response) {
    try {
        const authorName = req.params.author;
        const books: Book[] | undefined = await Book.getBooksByKey("author", authorName);
        if (!books) sendResponseAsJson(res, 404, "No book found!");
        else {
            sendResponseAsJson(res, 200, "Success", books);
        }
    } catch (error) {
        console.error(`Error fetching books by author:`, error);
        sendResponseAsJson(res, 500, "Failed to fetch books by author.");
    }
}

routes.push({path: "/book", router: bookRoutes});