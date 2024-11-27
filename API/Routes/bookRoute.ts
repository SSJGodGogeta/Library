import createEntityRoutes from "./routeTools.js";
import {Book} from "../../Database/Mapper/Entities/book.js";
import {Request, Response} from "express";

const bookRoutes = createEntityRoutes<Book>(
    {
        getAllFromCacheOrDB: Book.getBooksFromCacheOrDB,
        getByKey: Book.getBookByKey,
    },
    "book"
);
// you can add new routes like this:
// Add another GET route
bookRoutes.get("/author/:author", async (req: Request, res: Response) => {
    try {
        const authorName = req.params.author;
        // Perform fetch logic here (e.g., call Book.getBooksByAuthor(authorName))
        const book: Book | undefined = await Book.getBookByKey("author", authorName);
        console.log(`Fetching books by author: ${authorName}:`);
        console.log(book);
        res.status(200).json(book);
    } catch (error) {
        console.error(`Error fetching books by author:`, error);
        res.status(500).json({message: `Failed to fetch books by author`});
    }
});

export default bookRoutes;