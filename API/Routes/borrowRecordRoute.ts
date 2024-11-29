import createEntityRoutes, {routes, sendResponseAsJson} from "../routeTools.js";
import {BorrowRecord} from "../../Database/Mapper/Entities/borrow_record.js";
import {Request, Response} from "express";
import {authenticate} from "../authenticationMiddleware.js";
import {Book_Copy} from "../../Database/Mapper/Entities/book_copy.js";
import {BorrowRecord_Techcode} from "../../Database/Mapper/Techcodes/BorrowRecord_Techcode.js";
import {Book} from "../../Database/Mapper/Entities/book.js";

const borrowRecordRoutes = createEntityRoutes<BorrowRecord>(
    {
        getAllFromCacheOrDB: BorrowRecord.getBorrowRecordsFromCacheOrDB,
        getByKey: BorrowRecord.getBorrowRecordsByKey,
    },
    "borrow_record"
);

borrowRecordRoutes.post("/borrow", authenticate, borrowBook);

async function borrowBook(req: Request, res: Response) {
    try {
        // check if the book_id is present and is a valid integer
        if (!req.body.book_id) return sendResponseAsJson(res, 422, "book_id is required!")

        const book_id: number = parseInt(req.body.book_id);
        if (isNaN(book_id)) return sendResponseAsJson(res, 422, "book_id must be a valid integer!");

        // get the book requested by the user
        let book: Book | undefined = await Book.getBookByKey('book_id', book_id);
        if (!book) return sendResponseAsJson(res, 404, "No book found!")

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
                Book.saveBook(book);
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

        await BorrowRecord.save(borrow_record);

        // save the found book copy as borrowed
        available_book_copy.status = BorrowRecord_Techcode.BORROWED;
        await Book_Copy.save(available_book_copy);

        // save the available copies count in the book
        if (book.available_copies || book.total_copies) {
            book.available_copies = (book.available_copies ?? book.total_copies)! - 1;
            await Book.saveBook(book);
        }

        return sendResponseAsJson(res, 200, "Success", {borrow_record});
    } catch (error) {
        console.error(`Error procession borrow request:`, error);
        return sendResponseAsJson(res, 500, "Failed process borrow request.");
    }
}

routes.push({path: "/borrowRecord", router: borrowRecordRoutes});