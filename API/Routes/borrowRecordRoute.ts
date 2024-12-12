import {routes} from "../routeTools.js";
import {BorrowRecord} from "../../Database/Mapper/Entities/borrow_record.js";
import {Request, Response, Router} from "express";
import {authenticate} from "../authenticationMiddleware.js";
import {Book_Copy} from "../../Database/Mapper/Entities/book_copy.js";
import {BorrowRecordTechcode} from "../../Database/Mapper/Techcodes/BorrowRecordTechcode.js";
import {Book} from "../../Database/Mapper/Entities/book.js";
import {User} from "../../Database/Mapper/Entities/user.js";
import {PermissionTechcode} from "../../Database/Mapper/Techcodes/PermissionTechcode.js";
import {sendResponseAsJson} from "./tools/sendResponseAsJson.js";

const router = Router();

router.post("/borrow", authenticate, borrowBook);
router.get("/myRecords", authenticate, myRecords);
router.get("/myRecords/book/:bookId", authenticate, myRecordsBook);
router.post("/return", authenticate, returnBook);
router.post("/reserve", authenticate, reserveBook);

async function borrowBook(req: Request, res: Response) {
    try {
        let result = await handleBase(req, res);
        // If result is null, a response has already been sent.
        if (!result) return;
        const {user: user, book: book} = result;
        // get a book copy that is currently not borrowed
        let availableBookCopy: Book_Copy | undefined = (await Book_Copy.getBookCopiesFromCacheOrDB()).find((copy) => copy.status == BorrowRecordTechcode.NOT_BORROWED && copy.book.book_id == book.book_id);

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
        const returnDate = calculateReturnDate(res, user, borrowDate);
        if (!returnDate) return;
        borrowRecord.status = BorrowRecordTechcode.BORROWED;
        borrowRecord.book_copy = availableBookCopy;
        borrowRecord.user = req.body.user;
        borrowRecord.borrow_date = borrowDate;
        borrowRecord.return_date = returnDate;

        await BorrowRecord.saveBorrowRecord(borrowRecord);
        // clear cache for the books and book copies
        await Book.resetBookCache();
        await Book_Copy.resetBookCopyCache();

        return sendResponseAsJson(res, 200, "Success", borrowRecord);
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

async function returnBook(req: Request, res: Response) {
    let result = await handleBase(req, res, true);
    // If result is null, a response has already been sent.
    if (!result) return;
    const {book: book, borrowedBook: borrowedBook} = result;
    if (!borrowedBook) {
        sendResponseAsJson(res, 422, "Could not find borrow entry");
        return;
    }
    borrowedBook.book_copy.status = BorrowRecordTechcode.NOT_BORROWED;
    borrowedBook.status = BorrowRecordTechcode.NOT_BORROWED;
    borrowedBook.return_date = new Date();
    book.available_copies ? book.available_copies += 1 : book.available_copies = 1;
    const overdue: boolean = new Date().getTime() > borrowedBook.return_date.getTime();
    //TODO Store this value in DB too.
    await BorrowRecord.saveBorrowRecord(borrowedBook);
    await Book.saveBook(book);
    await Book_Copy.saveBookCopy(borrowedBook.book_copy);
    return sendResponseAsJson(res, 200, "Success", overdue);
}

async function reserveBook(req: Request, res: Response) {
    let result = await handleBase(req, res);
    // If result is null, a response has already been sent.
    if (!result) return;
    const {user: user, book: book} = result;
    let bookCopies: Book_Copy[] = await Book_Copy.getBookCopiesFromCacheOrDB();
    bookCopies = bookCopies.filter(copy => copy.book.book_id == book.book_id);
    let availableBookCopy: Book_Copy | undefined = bookCopies.find((copy) => copy.status == BorrowRecordTechcode.NOT_BORROWED);
    if (availableBookCopy) {
        return sendResponseAsJson(res, 400, "There are available copies of this book. No need to reserve it.");
    }
    // there are 0 available copies. If the book objects has saved a different value update it
    if (book.available_copies !== 0) {
        book.available_copies = 0;
        await Book.saveBook(book);
    }
    let borrowRecords: BorrowRecord[] = await BorrowRecord.getBorrowRecordsFromCacheOrDB();

    borrowRecords = borrowRecords.filter(record => bookCopies.some(copy => copy.book_copy_id == record.book_copy.book_copy_id));
    const nearestReturnBookCopy = borrowRecords.reduce<BorrowRecord | null>(
        (nearestRecord, currentRecord) => {
            // If nearestRecord is not set, initialize it with the currentRecord
            if (!nearestRecord) return currentRecord;

            // Compare return_date of currentRecord and nearestRecord
            return currentRecord.return_date < nearestRecord.return_date
                ? currentRecord
                : nearestRecord;
        },
        null // Explicitly set the initial value to null
    )?.book_copy; // Safely access book_copy
    if (!nearestReturnBookCopy) {
        console.error("Couldnt find any book copy.");
        return sendResponseAsJson(res, 404, "No available book copy found!");
    }
    const record = borrowRecords.find(rec => rec.book_copy.book_copy_id == nearestReturnBookCopy.book_copy_id);
    if (!record) return sendResponseAsJson(res, 404, `No record found that contains book_copy_id: ${nearestReturnBookCopy.book_copy_id}!`);
    const reserveBorrowRecord = new BorrowRecord();
    reserveBorrowRecord.book_copy = nearestReturnBookCopy;
    reserveBorrowRecord.user = user;
    reserveBorrowRecord.borrow_date = record.return_date;
    reserveBorrowRecord.status = BorrowRecordTechcode.RESERVED;
    const returnDate = calculateReturnDate(res, user, record.return_date);
    if (!returnDate) return;
    reserveBorrowRecord.return_date = returnDate;

    await BorrowRecord.saveBorrowRecord(reserveBorrowRecord);
    // clear cache for the books and book copies
    await Book.resetBookCache();
    await Book_Copy.resetBookCopyCache();
    return sendResponseAsJson(res, 200, "Success", reserveBorrowRecord);

}

async function handleBase(req: Request, res: Response, wantsToReturn: boolean = false) {
    if (!req.body.bookId) {
        sendResponseAsJson(res, 422, "bookId is required!");
        return null;
    }

    const bookId: number = parseInt(req.body.bookId);
    if (isNaN(bookId)) {
        sendResponseAsJson(res, 422, "bookId is NaN!");
        return null;
    }
    const book = await Book.getBook(res, bookId);
    if (!book) {
        sendResponseAsJson(res, 404, `Book by id: ${bookId} could not be found.`); // the getBookAndRecord function exited and already returned a status code
        return null;
    }
    const user: User | undefined = (req.body.user as User) ?? undefined;
    // From Arman: This case technically should never happen, because we have the authenticate check. However, if somehow it manages to bypass it, this would stop further execution.
    // Its also for our safety to pass the correct object to the function below, cause req.body.user is not guaranteed to be of type User (it doesnt have a type at all)
    // Additionally it saves us from further mistakes when accessing user.properties as we get the Webstorm auto complete feature
    if (!user) {
        sendResponseAsJson(res, 401, "You have to login in order to borrow books");
        return null;
    }
    const alreadyHasBorrowedBook = await BorrowRecord.getActiveBorrowRecordForBook(bookId, user);

    // check if the user already has
    if (alreadyHasBorrowedBook && !wantsToReturn) {
        sendResponseAsJson(res, 409, "The User already has a copy of this book");
        return null;
    }
    return {user: user, book: book, borrowedBook: alreadyHasBorrowedBook};
}


function calculateReturnDate(res: Response, user: User, startDate: Date) {
    const returnDate = new Date();
    switch (user.permissions) {
        case PermissionTechcode.ADMIN:
            returnDate.setDate(startDate.getDate() + 365);
            break;
        case PermissionTechcode.EMPLOYEE:
        case PermissionTechcode.PROFESSOR:
            returnDate.setDate(startDate.getDate() + 60);
            break;
        case PermissionTechcode.STUDENT:
            returnDate.setDate(startDate.getDate() + 30);
            break;
        default:
            sendResponseAsJson(res, 404, `You dont have any registered permissions and therefore are not allowed to borrow a book.\nPlease contact a staff member.`);
            return null;
    }
    return returnDate;
}

routes.push({path: "/borrowRecord", router: router});