import {BaseEntity, Column, Entity, PrimaryColumn,} from 'typeorm';
import {Availability_Techcode} from "../Techcodes/Availability_Techcode.js";

@Entity('book')
export class Book extends BaseEntity {
    @PrimaryColumn({name: "book_id"})
    book_id!: number;

    @Column({length: '60', nullable: false})
    title!: String;

    @Column({length: '2000', nullable: true})
    description?: String;

    @Column({length: '30', nullable: true})
    publisher?: String;

    @Column({length: '60', nullable: true})
    author?: String;

    @Column({nullable: true})
    year?: number;

    @Column({nullable: true})
    edition?: number;

    @Column({length: '13', nullable: false})
    isbn!: String;

    @Column({length: '3', nullable: true})
    language_code?: String;

    @Column({nullable: true})
    total_copies?: number;

    @Column({nullable: true})
    available_copies?: number;

    @Column({type: 'float', nullable: true})
    average_rating?: number;

    @Column({nullable: true})
    times_borrowed?: number;

    @Column({type: 'float', nullable: false})
    sum_rating!: number;

    @Column({type: 'int', nullable: false})
    count_rating!: number;

    @Column({type: 'text', nullable: true})
    cover_url?: string;

    @Column({length: '50', nullable: false})
    availability!: Availability_Techcode;

    static async getBooksFromCacheOrDB(): Promise<Book[]> {
        if (!books) books = await Book.find();
        return books;
    }

    static async resetBookCache(): Promise<void> {
        books = null;
        console.log("Reset Book cache");
        await this.getBooksFromCacheOrDB();
    }

    static async getBookByKey<K extends keyof Book>(keyName: K, keyValue: Book[K]): Promise<Book | undefined> {
        const books: Book[] = await Book.getBooksFromCacheOrDB();
        if (!books) return undefined;
        return books.find(book => book[keyName] === keyValue);
    }

    static async getBooksByKey<K extends keyof Book>(keyName: K, keyValue: Book[K]): Promise<Book[] | undefined> {
        const books: Book[] = await Book.getBooksFromCacheOrDB();
        if (!books) return undefined;
        return books.filter(copy => copy[keyName] === keyValue);
    }

    static async saveBook(book: Book): Promise<void> {
        await book.save();
        await this.resetBookCache();
    }
}

let books: Book[] | null = null;