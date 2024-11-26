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
}