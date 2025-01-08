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
import {AvailabilityTechcode} from "../../Database/Mapper/Techcodes/AvailabilityTechcode.js";
import {Reservation} from "../../Database/Mapper/Entities/reservation.js";

const router = Router();

router.post("/borrow", authenticate, borrowBook);
router.get("/myRecords/book/:bookId", authenticate, myRecordsBook);
router.post("/return", authenticate, returnBook);
router.post("/reserve", authenticate, reserveBook);// Router definitions
router.get("/ActiveRecordsByUserId/:userId", authenticate, (req, res) => handleRecords(req, res, true, true));
router.get("/AllRecordsByUserId/:userId", authenticate, (req, res) => handleRecords(req, res, false, true));
router.get("/myActiveRecords", authenticate, (req, res) => handleRecords(req, res, true, false));
router.get("/AllMyRecords", authenticate, (req, res) => handleRecords(req, res, false, false));

// Generic function to handle record fetching
async function handleRecords(req: Request, res: Response, onlyActive: boolean, useParamId: boolean) {
    try {
        // Determine the user ID from either the route parameter or the request body
        const userId = useParamId ? parseInt(req.params.userId, 10) : req.body.user?.user_id;

        if (!userId) {
            return sendResponseAsJson(res, 400, "Invalid or missing user ID.");
        }

        // Fetch all borrow records
        const borrowRecords: BorrowRecord[] = await BorrowRecord.getBorrowRecordsFromCacheOrDB();

        // Filter based on user ID and optionally status
        const filteredRecords: BorrowRecord[] = borrowRecords.filter(record =>
            record.user.user_id === userId &&
            (!onlyActive || [BorrowRecordTechcode.BORROWED, BorrowRecordTechcode.RESERVED].includes(record.status))
        );

        // Sort active records (if onlyActive) to place BORROWED before RESERVED
        if (onlyActive) {
            filteredRecords.sort((a, b) => {
                if (a.status === BorrowRecordTechcode.BORROWED && b.status !== BorrowRecordTechcode.BORROWED) {
                    return -1;
                }
                if (a.status !== BorrowRecordTechcode.BORROWED && b.status === BorrowRecordTechcode.BORROWED) {
                    return 1;
                }
                return 0; // Maintain relative order if statuses are equal
            });
        }

        // Return the filtered and sorted records
        return sendResponseAsJson(res, 200, "Success", filteredRecords);
    } catch (error) {
        console.error("Error processing borrow request:", error);
        return sendResponseAsJson(res, 500, "Failed to process borrow request.");
    }
}


async function borrowBook(req: Request, res: Response) {
    try {
        let result = await handleBase(req, res);
        // If result is null, a response has already been sent.
        if (!result) return;
        const {user: user, book: book} = result;
        // get a book copy that is currently not borrowed
        let availableBookCopy: Book_Copy | undefined = (await Book_Copy.getBookCopiesFromCacheOrDB()).find((copy) => copy.status == AvailabilityTechcode.AVAILABLE && copy.book.book_id == book.book_id);

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
    const {book: book, borrowedBook: borrowedBookRecord} = result;
    if (!borrowedBookRecord) {
        sendResponseAsJson(res, 422, "Could not find borrow entry");
        return;
    }
    borrowedBookRecord.book_copy.status = AvailabilityTechcode.AVAILABLE;
    borrowedBookRecord.status = BorrowRecordTechcode.RETURNED;
    borrowedBookRecord.return_date = new Date();
    book.available_copies ? book.available_copies += 1 : book.available_copies = 1;
    const overdue: boolean = new Date().getTime() > borrowedBookRecord.return_date.getTime();
    //TODO Store this value in DB too.
    await BorrowRecord.saveBorrowRecord(borrowedBookRecord);
    await Book.saveBook(book);
    await Book_Copy.saveBookCopy(borrowedBookRecord.book_copy);
    return sendResponseAsJson(res, 200, "Success", overdue);
}

async function reserveBook(req: Request, res: Response) {
    let result = await handleBase(req, res);
    // If result is null, a response has already been sent.
    if (!result || !result.book || !result.user) return;
    const {user: user, book: book} = result;
    let bookCopies: Book_Copy[] = await Book_Copy.getBookCopiesFromCacheOrDB();
    // Book copies of the desired book to reserve
    bookCopies = bookCopies.filter(copy => copy.book.book_id == book.book_id);
    let availableBookCopy: Book_Copy | undefined = bookCopies.find((copy) => copy.status == AvailabilityTechcode.AVAILABLE);
    if (availableBookCopy) {
        return sendResponseAsJson(res, 400, `There are available copies of this book. No need to reserve it. Copy: ${availableBookCopy.book_copy_id}`);
    }
    // there are 0 available copies. If the book objects has saved a different value update it
    if (book.available_copies !== 0) {
        book.available_copies = 0;
        await Book.saveBook(book);
    }
    let borrowRecords: BorrowRecord[] = await BorrowRecord.getBorrowRecordsFromCacheOrDB();
    let reservations: Reservation[] = await Reservation.getReservationFromCacheOrDB();
    // does the user already have the same book reserved ?

    reservations = reservations.filter(reserv => reserv.book.book_id == book.book_id && reserv.user.user_id == user.user_id);
    if (reservations.length > 0) return sendResponseAsJson(res, 400, "You already have the same book reserved");
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
    if (borrowRecords.some(record => record.user.user_id == user.user_id && bookCopies.some(copy => copy.book_copy_id == nearestReturnBookCopy.book_copy_id))) {
        return sendResponseAsJson(res, 400, "You already have the same book reserved");
    }
    const record = borrowRecords.find(rec => rec.book_copy.book_copy_id == nearestReturnBookCopy.book_copy_id);
    if (!record) return sendResponseAsJson(res, 404, `No record found that contains book_copy_id: ${nearestReturnBookCopy.book_copy_id}!`);
    const newReserveRecord = new Reservation();
    newReserveRecord.book = nearestReturnBookCopy.book;
    newReserveRecord.user = user;
    newReserveRecord.borrowRecord = record;
    newReserveRecord.startDate = record.return_date;
    newReserveRecord.bookCopyId = nearestReturnBookCopy;
    const returnDate = calculateReturnDate(res, user, record.return_date);
    if (!returnDate) return;
    newReserveRecord.returnDate = returnDate;
    // TODO: should the record.status change to reserved afterwards ?

    await Reservation.saveReservation(newReserveRecord);
    // clear cache for the books and book copies
    await Book.resetBookCache();
    await Book_Copy.resetBookCopyCache();
    await Reservation.resetReservationsCache();
    return sendResponseAsJson(res, 200, "Success", newReserveRecord);

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