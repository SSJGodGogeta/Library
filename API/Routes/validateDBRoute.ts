import {Book} from "../../Database/Mapper/Entities/book.js";
import {Book_Copy} from "../../Database/Mapper/Entities/book_copy.js";
import {BorrowRecordTechcode} from "../../Database/Mapper/Techcodes/BorrowRecordTechcode.js";
import {AvailabilityTechcode} from "../../Database/Mapper/Techcodes/AvailabilityTechcode.js";
import {Request, Response, Router} from "express";

import {routes, sendResponseAsJson} from "../routeTools.js";
import {authenticate} from "../authenticationMiddleware.js";


const router = Router();

async function validateDatabase() {
    console.log("Validating book copies..");
    let isValidTotalCopies: boolean = true;
    let isValidAvailableCopies: boolean = true;
    const books: Book[] | null = await Book.getBooksFromCacheOrDB();
    const bookCopies: Book_Copy[] | null = await Book_Copy.getBookCopiesFromCacheOrDB();


    if (!books) {
        if (bookCopies.length > 0) {
            console.error("Impossible to have book copies without having books. Deleting all entries in the book_copy table");
            for (const bookcopy of bookCopies) {
                await bookcopy.remove();
                await Book_Copy.saveBookCopy(bookcopy);
            }
        }
        return {
            isValidTotalCopies: false,
            isValidAvailableCopies: false,
            isValidTimesBorrowed: false
        };
    } // If there are no books then there cant be a book copy either.


    for (let i = 0; i <= books.length; i++) {
        if (!books[i]) continue;
        const bookTotalCopiesById: Book_Copy[] = bookCopies.filter(copy => copy.book.book_id == i + 1);
        const bookAvailableCopiesById: Book_Copy[] = bookCopies.filter(copy => copy.book.book_id == i + 1 && copy.status == BorrowRecordTechcode.NOT_BORROWED);
        const availability: AvailabilityTechcode = bookCopies.some(bookCopy => bookCopy.status == BorrowRecordTechcode.NOT_BORROWED) ? AvailabilityTechcode.AVAILABLE : AvailabilityTechcode.NOT_AVAILABLE;

        if (availability != books[i].availability) {
            books[i].availability = availability;
            await Book.saveBook(books[i]);
            console.log(`Changed availability for book with ID: ${books[i].book_id} to ${availability}`);
        }

        if (books[i].total_copies != bookTotalCopiesById.length) {
            books[i].total_copies = bookTotalCopiesById.length;
            await Book.saveBook(books[i]);
            isValidTotalCopies = false;
            console.warn(`Data manipulation detected!\nChanged total book copies to ${bookTotalCopiesById.length} for book with ID: ${books[i].book_id}`);
        }

        if (books[i].available_copies != bookAvailableCopiesById.length) {
            books[i].available_copies = bookAvailableCopiesById.length;
            await Book.saveBook(books[i]);
            isValidAvailableCopies = false;
            console.warn(`Data manipulation detected!\nChanged available book copies to ${bookAvailableCopiesById.length} for book with ID: ${books[i].book_id}`);
        }
    }
    return {
        isValidTotalCopies: isValidTotalCopies,
        isValidAvailableCopies: isValidAvailableCopies,
    };
}

router.get("/", authenticate, checkDatabase);

async function checkDatabase(_req: Request, res: Response) {
    try {
        const result = await validateDatabase();
        sendResponseAsJson(res, 200, "Success", result);
    } catch (error) {
        console.error("Error while validating database:", error);
        sendResponseAsJson(res, 500, "Error while validating database");
    }
}

routes.push({path: "/validateDB", router: router});