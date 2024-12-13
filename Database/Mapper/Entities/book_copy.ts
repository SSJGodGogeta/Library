import {BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn,} from 'typeorm';

import {Book} from "./book.js"
import {AvailabilityTechcode} from "../Techcodes/AvailabilityTechcode.js";

@Entity('book_copy')
export class Book_Copy extends BaseEntity {
    @PrimaryColumn({name: "book_copy_id"})
    book_copy_id!: number;

    @Column({length: '50', nullable: false})
    status!: AvailabilityTechcode;

    @ManyToOne('Book', (book: Book) => book.book_id)
    @JoinColumn({
        name: 'book_book_id',
        referencedColumnName: 'book_id',
        foreignKeyConstraintName: 'fk_book_copy_book1'
    })
    book!: Book;

    static async getBookCopiesFromCacheOrDB(): Promise<Book_Copy[]> {
        if (!bookCopies) bookCopies = await Book_Copy.find({
            relations: {
                book: true
            }
        });
        return bookCopies;
    }

    static async resetBookCopyCache(): Promise<void> {
        bookCopies = null;
        console.log("Reset Book copy cache");
        await this.getBookCopiesFromCacheOrDB();
    }

    static async getBookCopyByKey<K extends keyof Book_Copy>(keyName: K, keyValue: Book_Copy[K]): Promise<Book_Copy | undefined> {
        const bookCopies: Book_Copy[] = await Book_Copy.getBookCopiesFromCacheOrDB();
        if (!bookCopies) return undefined;
        return bookCopies.find(copy => copy[keyName] === keyValue);
    }

    static async getBooksCopyByKey<K extends keyof Book_Copy>(keyName: K, keyValue: Book_Copy[K]): Promise<Book_Copy[] | undefined> {
        const bookCopies: Book_Copy[] = await Book_Copy.getBookCopiesFromCacheOrDB();
        if (!bookCopies) return undefined;
        return bookCopies.filter(copy => copy[keyName] === keyValue);
    }

    static async saveBookCopy(bookCopy: Book_Copy): Promise<void> {
        await bookCopy.save();
        await this.resetBookCopyCache();
    }
}

let bookCopies: Book_Copy[] | null = null;