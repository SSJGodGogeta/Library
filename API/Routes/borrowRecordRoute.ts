import {routes, sendResponseAsJson} from "../routeTools.js";
import {BorrowRecord} from "../../Database/Mapper/Entities/borrow_record.js";
import {Request, Response, Router} from "express";
import {authenticate} from "../authenticationMiddleware.js";
import {Book_Copy} from "../../Database/Mapper/Entities/book_copy.js";
import {BorrowRecord_Techcode} from "../../Database/Mapper/Techcodes/BorrowRecord_Techcode.js";
import {Book} from "../../Database/Mapper/Entities/book.js";
import {User} from "../../Database/Mapper/Entities/user.js";

// const borrowRecordRoutes = createEntityRoutes<BorrowRecord>(
//     {
//         getAllFromCacheOrDB: BorrowRecord.getBorrowRecordsFromCacheOrDB,
//         getByKey: BorrowRecord.getBorrowRecordsByKey,
//     },
//     "borrow_record"
// );

const router = Router();

router.post("/borrow", authenticate, borrowBook);
router.get("/myRecords/book/:book_id", authenticate, myRecordsBook);

/**
 * Retrieves a book by its ID and sends a response if the book is not found.
 *
 * @async
 * @function getBook
 * @param {Response} res - The HTTP response object to send responses.
 * @param {number} book_id - The ID of the book to retrieve.
 * @returns {Promise<Book | void>} A promise resolving to the retrieved book or void if not found or invalid.
 *
 * @throws {Error} Throws an error if the database query fails.
 *
 * @example
 * // Example usage
 * const book = await getBookAndRecord(response, 123);
 * if (book) {
 *   console.log(`Book title: ${book.title}`);
 * }
 */
async function getBook(res: Response, book_id: number): Promise<Book | void> {
    if (isNaN(book_id)) return sendResponseAsJson(res, 422, "book_id must be a valid integer!");

    // get the book requested by the user
    let book: Book | undefined = await Book.getBookByKey('book_id', book_id);
    if (!book) return sendResponseAsJson(res, 404, "No book found!")

    return book;
}

/**
 * Retrieves the borrow record for a specific book and user, filtering by active borrowing status.
 *
 * @async
 * @function getBorrowRecord
 * @param {number} book_id - The ID of the book to check the borrow record for.
 * @param {User} user - The user whose borrow record is to be retrieved.
 * @returns {Promise<BorrowRecord | null>} A promise resolving to the borrow record if found, or null otherwise.
 *
 * @throws {Error} Throws an error if the database query fails.
 *
 * @example
 * // Example usage
 * const borrowRecord = await getBorrowRecord(123, currentUser);
 * if (borrowRecord) {
 *   console.log(`Borrow record ID: ${borrowRecord.id}`);
 * } else {
 *   console.log('No active borrow record found for this book and user.');
 * }
 */
async function getBorrowRecord(book_id: number, user: User): Promise<BorrowRecord | null> {
    return await BorrowRecord.findOne({
        where: {
            status: BorrowRecord_Techcode.BORROWED,
            user: user,
            book_copy: {
                book: {
                    book_id: book_id,
                },
            },
        },
        relations: {
            user: true,
            book_copy: {
                book: true,
            },
        },
    });
}

async function borrowBook(req: Request, res: Response) {
    try {
        // check if the book_id is present and is a valid integer
        if (!req.body.book_id) return sendResponseAsJson(res, 422, "book_id is required!")

        const book_id: number = parseInt(req.body.book_id);

        const book = await getBook(res, book_id);
        if (!book) return; // the getBookAndRecord function exited and already returned a status code

        const current_borrow_record = await getBorrowRecord(book_id, req.body.user);

        // check if the user already has
        if (current_borrow_record) return sendResponseAsJson(res, 409, "The User already has a copy of this book");

        // get a book copy that is currently not borrowed
        let available_book_copy: Book_Copy | null = await Book_Copy.findOne({
            where: {
                status: BorrowRecord_Techcode.NOT_BORROWED,
                book: {
                    book_id: book_id,
                },
            },
            relations: {
                book: true,
            },
        });
        if (!available_book_copy) {
            // there are 0 available copies. If the book objects has saved a different value update it
            if (book.available_copies !== 0) {
                book.available_copies = 0;
                await Book.saveBook(book);
            }

            return sendResponseAsJson(res, 404, "No available book copy found!");
        }

        // create the new borrow record
        const borrow_record: BorrowRecord = new BorrowRecord()

        let borrow_date = new Date();

        let return_date = new Date();
        return_date.setDate(borrow_date.getDate() + 14)

        borrow_record.status = BorrowRecord_Techcode.BORROWED;
        borrow_record.book_copy = available_book_copy;
        borrow_record.user = req.body.user;
        borrow_record.borrow_date = borrow_date;
        borrow_record.return_date = return_date;

        await BorrowRecord.saveBorrowRecord(borrow_record);

        // clear cache for the books and book copies
        await Book.resetBookCache();
        await Book_Copy.resetBookCopyCache();

        return sendResponseAsJson(res, 200, "Success", {borrow_record});
    } catch (error) {
        console.error(`Error procession borrow request:`, error);
        return sendResponseAsJson(res, 500, "Failed process borrow request.");
    }
}

async function myRecordsBook(req: Request, res: Response) {
    try {
        const book_id = parseInt(req.params.book_id);

        const current_borrow_record: BorrowRecord | null = await getBorrowRecord(book_id, req.body.user);
        // if (!current_borrow_record) return sendResponseAsJson(res, 404, "No borrow record found");

        return sendResponseAsJson(res, 200, "Success", { current_borrow_record })
    } catch (error) {
        console.error(`Error procession borrow request:`, error);
        return sendResponseAsJson(res, 500, "Failed process borrow request.");
    }
}

routes.push({path: "/borrowRecord", router: router});