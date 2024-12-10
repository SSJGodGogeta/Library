import {routes, sendResponseAsJson} from "../routeTools.js";
import {BorrowRecord} from "../../Database/Mapper/Entities/borrow_record.js";
import {Request, Response, Router} from "express";
import {authenticate} from "../authenticationMiddleware.js";
import {Book_Copy} from "../../Database/Mapper/Entities/book_copy.js";
import {BorrowRecord_Techcode} from "../../Database/Mapper/Techcodes/BorrowRecord_Techcode.js";
import {Book} from "../../Database/Mapper/Entities/book.js";

const router = Router();

router.post("/borrow", authenticate, borrowBook);
router.get("/myRecords/", authenticate, myRecords);
router.get("/myRecords/book/:book_id", authenticate, myRecordsBook);

async function borrowBook(req: Request, res: Response) {
    try {
        // check if the book_id is present and is a valid integer
        if (!req.body.book_id) return sendResponseAsJson(res, 422, "book_id is required!")

        const book_id: number = parseInt(req.body.book_id);

        const book = await Book.getBook(res, book_id);
        if (!book) return; // the getBookAndRecord function exited and already returned a status code

        const current_borrow_record = await BorrowRecord.getActiveBorrowRecordForBook(book_id, req.body.user);

        // check if the user already has
        if (current_borrow_record) return sendResponseAsJson(res, 409, "The User already has a copy of this book");

        // get a book copy that is currently not borrowed
        let available_book_copy: Book_Copy | undefined = (await Book_Copy.getBookCopiesFromCacheOrDB()).find((copy) => copy.status == BorrowRecord_Techcode.NOT_BORROWED && copy.book.book_id == book_id);

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

async function myRecords(req: Request, res: Response) {
    try {
        // get all active borrow_records for a user
        const borrow_records: BorrowRecord[] = await BorrowRecord.getBorrowRecordsFromCacheOrDB();
        const active_borrow_record: BorrowRecord[] = borrow_records.filter((record) => record.user.user_id === req.body.user.user_id);

        return sendResponseAsJson(res, 200, "Success", active_borrow_record);
    } catch (error) {
        console.error(`Error procession borrow request:`, error);
        return sendResponseAsJson(res, 500, "Failed process borrow request.");
    }
}

async function myRecordsBook(req: Request, res: Response) {
    try {
        const book_id = parseInt(req.params.book_id);

        const current_borrow_record: BorrowRecord | null = await fetchBorrowRecordForBook(book_id, req.body.user);
        // if (!current_borrow_record) return sendResponseAsJson(res, 404, "No borrow record found");

        return sendResponseAsJson(res, 200, "Success", { current_borrow_record })
    } catch (error) {
        console.error(`Error procession borrow request:`, error);
        return sendResponseAsJson(res, 500, "Failed process borrow request.");
    }
}

routes.push({path: "/borrowRecord", router: router});