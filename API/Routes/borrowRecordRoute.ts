import {routes, sendResponseAsJson} from "../routeTools.js";
import {BorrowRecord} from "../../Database/Mapper/Entities/borrow_record.js";
import {Request, Response, Router} from "express";
import {authenticate} from "../authenticationMiddleware.js";
import {Book_Copy} from "../../Database/Mapper/Entities/book_copy.js";
import {BorrowRecordTechcode} from "../../Database/Mapper/Techcodes/BorrowRecordTechcode.js";
import {Book} from "../../Database/Mapper/Entities/book.js";
import {User} from "../../Database/Mapper/Entities/user.js";
import {PermissionTechcode} from "../../Database/Mapper/Techcodes/PermissionTechcode.js";

const router = Router();

router.post("/borrow", authenticate, borrowBook);
router.get("/myRecords", authenticate, myRecords);
router.get("/myRecords/book/:bookId", authenticate, myRecordsBook);

async function borrowBook(req: Request, res: Response) {
    try {
        // check if the bookId is present and is a valid integer
        if (!req.body.bookId) return sendResponseAsJson(res, 422, "bookId is required!")

        const bookId: number = parseInt(req.body.bookId);
        if (isNaN(bookId)) return sendResponseAsJson(res, 422, "bookId is NaN!")

        const book = await Book.getBook(res, bookId);
        if (!book) return sendResponseAsJson(res, 404, `Book by id: ${bookId} could not be found.`); // the getBookAndRecord function exited and already returned a status code
        const user: User | undefined = (req.body.user as User) ?? undefined;
        // From Arman: This case technically should never happen, because we have the authenticate check. However, if somehow it manages to bypass it, this would stop further execution.
        // Its also for our safety to pass the correct object to the function below, cause req.body.user is not guaranteed to be of type User (it doesnt have a type at all)
        // Additionally it saves us from further mistakes when accessing user.properties as we get the Webstorm auto complete feature
        if (!user) return sendResponseAsJson(res, 401, "You have to login in order to borrow books");
        const currentBorrowRecord = await BorrowRecord.getActiveBorrowRecordForBook(bookId, user);

        // check if the user already has
        if (currentBorrowRecord) return sendResponseAsJson(res, 409, "The User already has a copy of this book");

        // get a book copy that is currently not borrowed
        let availableBookCopy: Book_Copy | undefined = (await Book_Copy.getBookCopiesFromCacheOrDB()).find((copy) => copy.status == BorrowRecordTechcode.NOT_BORROWED && copy.book.book_id == bookId);

        if (!availableBookCopy) {
            // there are 0 available copies. If the book objects has saved a different value update it
            if (book.available_copies !== 0) {
                book.available_copies = 0;
                await Book.saveBook(book);
            }

            return sendResponseAsJson(res, 404, "No available book copy found!");
        }

        // create the new borrow record
        const borrowRecord: BorrowRecord = new BorrowRecord();
        let borrowDate = new Date();
        let returnDate = new Date();
        switch (user.permissions) {
            case PermissionTechcode.ADMIN:
                returnDate.setDate(borrowDate.getDate() + 365);
                break;
            case PermissionTechcode.EMPLOYEE:
            case PermissionTechcode.PROFESSOR:
                returnDate.setDate(borrowDate.getDate() + 60);
                break;
            case PermissionTechcode.STUDENT:
                returnDate.setDate(borrowDate.getDate() + 30);
                break;
            default:
                return sendResponseAsJson(res, 404, `You dont have any registered permissions and therefore are not allowed to borrow a book.\nPlease contact a staff member.`);
        }


        borrowRecord.status = BorrowRecordTechcode.BORROWED;
        borrowRecord.book_copy = availableBookCopy;
        borrowRecord.user = req.body.user;
        borrowRecord.borrow_date = borrowDate;
        borrowRecord.return_date = returnDate;

        await BorrowRecord.saveBorrowRecord(borrowRecord);

        // clear cache for the books and book copies
        await Book.resetBookCache();
        await Book_Copy.resetBookCopyCache();

        return sendResponseAsJson(res, 200, "Success", {borrowRecord});
    } catch (error) {
        console.error(`Error procession borrow request:`, error);
        return sendResponseAsJson(res, 500, "Failed process borrow request.");
    }
}

async function myRecords(req: Request, res: Response) {
    try {
        // get all active borrowRecords for a user
        const borrowRecords: BorrowRecord[] = await BorrowRecord.getBorrowRecordsFromCacheOrDB();
        const activeBorrowRecord: BorrowRecord[] = borrowRecords.filter((record) => record.user.user_id === req.body.user.user_id);

        return sendResponseAsJson(res, 200, "Success", activeBorrowRecord);
    } catch (error) {
        console.error(`Error procession borrow request:`, error);
        return sendResponseAsJson(res, 500, "Failed process borrow request.");
    }
}

async function myRecordsBook(req: Request, res: Response) {
    try {
        const bookId = parseInt(req.params.bookId);
        if (isNaN(bookId)) return sendResponseAsJson(res, 404, "BookId is required!");
        const currentBorrowRecord: BorrowRecord | null = await BorrowRecord.getActiveBorrowRecordForBook(bookId, req.body.user);
        return sendResponseAsJson(res, 200, "Success", currentBorrowRecord)
    } catch (error) {
        console.error(`Error procession borrow request:`, error);
        return sendResponseAsJson(res, 500, "Failed process borrow request.");
    }
}

routes.push({path: "/borrowRecord", router: router});