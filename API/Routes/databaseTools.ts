import {Book} from "../../Database/Mapper/Entities/book.js";
import {Book_Copy} from "../../Database/Mapper/Entities/book_copy.js";
import {BorrowRecord_Techcode} from "../../Database/Mapper/Techcodes/BorrowRecord_Techcode.js";
import {BorrowRecord} from "../../Database/Mapper/Entities/borrow_record.js";
import {Availability_Techcode} from "../../Database/Mapper/Techcodes/Availability_Techcode.js";
import {Request, Response, Router} from "express";

import {sendResponseAsJson} from "./routeTools.js";


const router = Router();

async function validateDatabase() {
    console.log("Validating book copies..");
    let isValidTotalCopies: boolean = true;
    let isValidAvailableCopies: boolean = true;
    let isValidAverageRating: boolean = true;
    let isValidTimesBorrowed: boolean = true;
    const books: Book[] | null = await Book.getBooksFromCacheOrDB();
    const bookCopies: Book_Copy[] | null = await Book_Copy.getBookCopiesFromCacheOrDB();
    const borrowRecords: BorrowRecord[] | null = await BorrowRecord.getBorrowRecordsFromCacheOrDB();


    if (!books) {
        if (bookCopies.length > 0) {
            console.error("Impossible to have book copies without having books. Deleting all entries in the book_copy table");
            for (const bookcopy of bookCopies) {
                await bookcopy.remove();
                await bookcopy.save();
            }
        }
        return {
            isValidTotalCopies: false,
            isValidAvailableCopies: false,
            isValidAverageRating: false,
            isValidTimesBorrowed: false
        };
    } // If there are no books then there cant be a book copy either.


    for (let i = 0; i <= books.length; i++) {
        if (!books[i]) continue;
        const bookTotalCopiesById: Book_Copy[] = bookCopies.filter(copy => copy.book.book_id == i + 1);
        const bookAvailableCopiesById: Book_Copy[] = bookCopies.filter(copy => copy.book.book_id == i + 1 && copy.status == BorrowRecord_Techcode.NOT_BORROWED);
        const availability: Availability_Techcode = bookCopies.some(bookCopy => bookCopy.status == BorrowRecord_Techcode.NOT_BORROWED) ? Availability_Techcode.AVAILABLE : Availability_Techcode.NOT_AVAILABLE;

        if (availability != books[i].availability) {
            books[i].availability = availability;
            await books[i].save();
            console.log(`Changed availability for book with ID: ${books[i].book_id} to ${availability}`);
        }

        if (books[i].total_copies != bookTotalCopiesById.length) {
            books[i].total_copies = bookTotalCopiesById.length;
            await books[i].save();
            isValidTotalCopies = false;
            console.warn(`Data manipulation detected!\nChanged total book copies to ${bookTotalCopiesById.length} for book with ID: ${books[i].book_id}`);
        }

        if (books[i].available_copies != bookAvailableCopiesById.length) {
            books[i].available_copies = bookAvailableCopiesById.length;
            await books[i].save();
            isValidAvailableCopies = false;
            console.warn(`Data manipulation detected!\nChanged available book copies to ${bookAvailableCopiesById.length} for book with ID: ${books[i].book_id}`);
        }

        // this should give us all book copies for each book, that have a rating after being borrowed
        // If you however want to have all ratings regardless of the book being borrowed or not, remove the record.status from the filter
        const borrowRecordsOfBookWithRating: BorrowRecord[] | null = borrowRecords.filter(record => record.rating &&
            record.status == BorrowRecord_Techcode.BORROWED
            && record.book_copy.book.book_id == i + 1);
        const totalBorrowedBooks: Book[] | null = borrowRecords.filter(record => record.book_copy.book.book_id == i + 1).map(record => record.book_copy.book);
        console.log(`Going through records for book with id: ${books[i].book_id}`);
        if (books[i].times_borrowed != totalBorrowedBooks.length) {
            books[i].times_borrowed = totalBorrowedBooks.length;
            console.warn(`Data manipulation detected!\nChanged book times borrowed to ${totalBorrowedBooks.length} for book with ID: ${books[i].book_id}`);
            await books[i].save();
            isValidTimesBorrowed = false;
        }

        // map(record => record.book_copy)
        if (borrowRecordsOfBookWithRating.length > 0) {
            let averageRating: number = 0;
            for (const record of borrowRecordsOfBookWithRating) {
                averageRating += record.rating!;
            }
            averageRating = parseFloat((averageRating / borrowRecordsOfBookWithRating.length).toFixed(1));
            if (averageRating != books[i].average_rating) {
                books[i].average_rating = averageRating;
                console.warn(`Data manipulation detected!\nChanged average rating to ${averageRating} for book with ID: ${books[i].book_id}`);
                await books[i].save();
                isValidAverageRating = false;
            }
        }
    }
    return {
        isValidTotalCopies: isValidTotalCopies,
        isValidAvailableCopies: isValidAvailableCopies,
        isValidAverageRating: isValidAverageRating,
        isValidTimesBorrowed: isValidTimesBorrowed
    };
}

router.get("/", async (_req: Request, res: Response) => {
    try {
        const result = await validateDatabase();
        sendResponseAsJson(res, 200, "Success", result);
    } catch (error) {
        console.error("Error while validating database:", error);
        sendResponseAsJson(res, 500, "Error while validating database");
    }
});

export default router;