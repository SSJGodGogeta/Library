import {Book} from "../../Database/Mapper/Entities/book.js";
import {Book_Copy} from "../../Database/Mapper/Entities/book_copy.js";
import {BorrowRecord_Techcode} from "../../Database/Mapper/Techcodes/BorrowRecord_Techcode.js";
import {Router, Request, Response} from "express";
import {BorrowRecord} from "../../Database/Mapper/Entities/borrow_record";


const router = Router();

async function validateDatabase(){
    console.log("Validating book copies..");
    let isValidTotalCopies:boolean = true;
    let isValidAvailableCopies:boolean = true;
    let isValidAverageRating:boolean = true;
    const books: Book[] | null = await Book.getBooksFromCacheOrDB();
    const bookCopies: Book_Copy[] | null = await Book_Copy.getBookCopiesFromCacheOrDB();
    const borrowRecords: BorrowRecord[] | null = await  BorrowRecord.getBorrowRecordsFromCacheOrDB();
    if (!books) {
        if (bookCopies.length > 0) {
            console.error("Impossible to have book copies without having books. Deleting all entries in the book_copy table");
            for (const bookcopy of bookCopies) {
                await bookcopy.remove();
                await bookcopy.save();
            }
        }
        return {isValidTotalCopies: false, isValidAvailableCopies: false, isValidAverageRating: false};
    } // If there are no books then there cant be a book copy either.

    for (let i = 1; i <= books.length; i++) {
        const bookTotalCopiesById: Book_Copy[] = bookCopies.filter(copy => copy.book.book_id == i);
        const bookAvailableCopiesById: Book_Copy[] = bookCopies.filter(copy => copy.book.book_id == i && copy.status == BorrowRecord_Techcode.NOT_BORROWED);
        if (books[i].total_copies != bookTotalCopiesById.length) {
            books[i].total_copies = bookTotalCopiesById.length;
            //await books[i].save();
            isValidTotalCopies = false;
            console.warn(`Data manipulation detected!\nChanged total book copies to ${bookTotalCopiesById.length} for book with ID: ${books[i].book_id}`);
        }
        if (books[i].available_copies != bookAvailableCopiesById.length) {
            books[i].available_copies = bookAvailableCopiesById.length;
            //await books[i].save();
            isValidAvailableCopies = false;
            console.warn(`Data manipulation detected!\nChanged available book copies to ${bookAvailableCopiesById.length} for book with ID: ${books[i].book_id}`);
        }
        // this should give us all book copies for each book, that have a rating after being borrowed
        const borrowRecordsOfBookWithRating : BorrowRecord[]|null = borrowRecords.
        filter(record => record.rating &&
            record.status == BorrowRecord_Techcode.BORROWED
            && record.book_copy.book.book_id == i);

        // map(record => record.book_copy)
        if (borrowRecordsOfBookWithRating.length > 0) {
            console.log(borrowRecordsOfBookWithRating);
            let averageRating = 0;
            for (const record of borrowRecordsOfBookWithRating) {
                averageRating += record.rating!;
            }
            if (Math.round(averageRating/borrowRecordsOfBookWithRating.length) != books[i].average_rating) {
                books[i].average_rating = Math.round(averageRating/borrowRecordsOfBookWithRating.length);
                console.warn(`Data manipulation detected!\nChanged average rating to ${Math.round(averageRating/borrowRecordsOfBookWithRating.length)} for book with ID: ${books[i].book_id}`);
                //await books[i].save();
                isValidAverageRating = false;
            }
        }
        else console.warn("No book copies found in the borrow record table that have a rating.");
    }
    return {isValidTotalCopies: isValidTotalCopies, isValidAvailableCopies: isValidAvailableCopies, isValidAverageRating: isValidAverageRating};
}

router.get("/", async (_req: Request, res: Response) => {
    try {
        const result = await validateDatabase();
        res.status(200).json(result);
    } catch (error) {
        console.error("Error while validating database:", error);
        res.status(500).json({message: "Error while validating database:"});
    }
});

export default router;