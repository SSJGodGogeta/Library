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

async function getBookAndRecord(res: Response, book_id: number, user: User) {
    if (isNaN(book_id)) return sendResponseAsJson(res, 422, "book_id must be a valid integer!");

    // get the book requested by the user
    let book: Book | undefined = await Book.getBookByKey('book_id', book_id);
    if (!book) return sendResponseAsJson(res, 404, "No book found!")

    // check if the user currently has a copy of the book borrowed
    let current_borrow_record: BorrowRecord | null = await BorrowRecord.findOne({
        where: {
            status: BorrowRecord_Techcode.BORROWED,
            user: user,
            book_copy: {
                book: book,
            },
        },
        relations: {
            user: true,
            book_copy: {
                book: true,
            },
        },
    });

    return { book, current_borrow_record };
}

async function borrowBook(req: Request, res: Response) {
    try {
        // check if the book_id is present and is a valid integer
        if (!req.body.book_id) return sendResponseAsJson(res, 422, "book_id is required!")

        const book_id: number = parseInt(req.body.book_id);

        const book_and_record = await getBookAndRecord(res, book_id, req.body.user);
        if (!book_and_record) return; // the getBookAndRecord function exited and already returned a status code
        const { book, current_borrow_record } = book_and_record;

        // check if the user already has
        if (current_borrow_record) return sendResponseAsJson(res, 409, "The User already has a copy of this book");

        // get a book copy that is currently not borrowed
        let available_book_copy: Book_Copy | null = await Book_Copy.findOne({
            where: {
                status: BorrowRecord_Techcode.NOT_BORROWED,
                book: book,
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

        const book_and_record = await getBookAndRecord(res, book_id, req.body.user);
        if (!book_and_record) return; // the getBookAndRecord function exited and already returned a status code
        const { current_borrow_record } = book_and_record;

        return sendResponseAsJson(res, 200, "Success", { current_borrow_record })
    } catch (error) {
        console.error(`Error procession borrow request:`, error);
        return sendResponseAsJson(res, 500, "Failed process borrow request.");
    }
}

routes.push({path: "/borrowRecord", router: router});