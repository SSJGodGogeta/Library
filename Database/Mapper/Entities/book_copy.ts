import {
    Entity,
    Column,
     BaseEntity, PrimaryColumn,
     ManyToOne,
     JoinColumn,
} from 'typeorm';

import {Book} from "./book.js"
import {BorrowRecord_Techcode} from "../Techcodes/BorrowRecord_Techcode.js"

@Entity('book_copy')
export class Book_Copy extends BaseEntity {
    @PrimaryColumn({ name: "book_copy_id" })
    book_copy_id!: number;

    @Column({ length: '50', nullable: false })
    status!: BorrowRecord_Techcode;

    @ManyToOne('Book', (book:Book) => book.book_id)
    @JoinColumn({
        name: 'book_book_id',
        referencedColumnName: 'book_id',
        foreignKeyConstraintName: 'fk_book_copy_book1'
    })
    book!: Book;

    static async getBookCopiesFromCacheOrDB(): Promise<Book_Copy[]> {
        if (!bookCopies) bookCopies = await Book_Copy.find();
        return bookCopies;
    }

    static clearBookCopyCache():void {
        bookCopies = null;
        console.log("Cleared Book copy cache");
    }

    static async getBookCopyByKey<K extends keyof Book_Copy>(keyName: K, keyValue: Book_Copy[K]): Promise<Book_Copy | undefined> {
        const bookCopies:Book_Copy[] = await Book_Copy.getBookCopiesFromCacheOrDB();
        if (!bookCopies) return undefined;
        return bookCopies.find(copy => copy[keyName] === keyValue);
    }
}

let bookCopies: Book_Copy[]|null = null;