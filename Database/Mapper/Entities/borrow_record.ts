import {BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn,} from 'typeorm';
import {User} from './user.js';
import {Book_Copy} from './book_copy.js';
import {BorrowRecordTechcode} from '../Techcodes/BorrowRecordTechcode.js';
import {AvailabilityTechcode} from "../Techcodes/AvailabilityTechcode.js";

@Entity('borrow_record')
export class BorrowRecord extends BaseEntity {
    @PrimaryGeneratedColumn({name: 'borrow_record_id'})
    borrow_record_id!: number;

    @Column({type: 'datetime', nullable: false})
    borrow_date!: Date;

    @Column({type: 'datetime', nullable: false})
    return_date!: Date;

    @Column({length: '50', nullable: false})
    status!: BorrowRecordTechcode;

    @Column({type: "double", nullable: true})
    rating?: number;

    @ManyToOne('Book_Copy', (book_copy: Book_Copy) => book_copy.book_copy_id)
    @JoinColumn({
        name: 'book_copy_book_copy_id',
        referencedColumnName: 'book_copy_id',
        foreignKeyConstraintName: 'fk_borrow_record_book_copy1'
    })
    book_copy!: Book_Copy;

    @ManyToOne('User', (user: User) => user.user_id)
    @JoinColumn({
        name: 'user_user_id',
        referencedColumnName: 'user_id',
        foreignKeyConstraintName: 'fk_borrow_record_user1'
    })
    user!: User;

    static async getBorrowRecordsFromCacheOrDB(): Promise<BorrowRecord[]> {
        if (!borrowRecords) borrowRecords = await BorrowRecord.find({
            relations: {
                book_copy: {
                    book: true
                },
                user: true,
            }
        });
        return borrowRecords;
    }

    static async resetBorrowRecordsCache(): Promise<void> {
        borrowRecords = null;
        console.log("Reset Borrow records cache");
        await this.getBorrowRecordsFromCacheOrDB();
    }

    static async getBorrowRecordsByKey<K extends keyof BorrowRecord>(keyName: K, keyValue: BorrowRecord[K]): Promise<BorrowRecord | undefined> {
        const borrowRecords: BorrowRecord[] = await BorrowRecord.getBorrowRecordsFromCacheOrDB();
        if (!borrowRecords) return undefined;
        return borrowRecords.find(record => record[keyName] === keyValue);
    }

    static async saveBorrowRecord(borrowRecord: BorrowRecord): Promise<void> {
        const records = await BorrowRecord.getBorrowRecordsFromCacheOrDB();
        records.forEach((record: BorrowRecord) => {
            // Automatically shift reserved copies to "borrowed".
            if (record.borrow_date.getTime() < new Date().getTime() && record.status == BorrowRecordTechcode.RESERVED) {
                record.status = BorrowRecordTechcode.BORROWED;
                record.book_copy.status = AvailabilityTechcode.NOT_AVAILABLE;
                record.save();
                this.resetBorrowRecordsCache();
            }
        })
        await borrowRecord.save();
        await this.resetBorrowRecordsCache();
    }

    /**
     * Retrieves the borrow record for a specific book and user, filtering by active borrowing status.
     *
     * @async
     * @function getActiveBorrowRecordForBook
     * @param {number} bookId - The ID of the book to check the borrow record for.
     * @param {User} user - The user whose borrow record is to be retrieved.
     * @returns {Promise<BorrowRecord | null>} A promise resolving to the borrow record if found, or null otherwise.
     *
     * @throws {Error} Throws an error if the database query fails.
     *
     * @example
     * // Example usage
     * const borrowRecord = await getBorrowRecord(123, currentUser);
     * if (borrowRecord) {
     *   console.log(`Borrow record ID: ${borrowRecord.id}`);
     * } else {
     *   console.log('No active borrow record found for this book and user.');
     * }
     */
    static async getActiveBorrowRecordForBook(bookId: number, user: User): Promise<BorrowRecord | null> {
        return await BorrowRecord.findOne({
            where: {
                status: BorrowRecordTechcode.BORROWED,
                user: user,
                book_copy: {
                    book: {
                        book_id: bookId,
                    },
                },
            },
            relations: {
                user: true,
                book_copy: {
                    book: true,
                },
            },
        });
    }
}

let borrowRecords: BorrowRecord[] | null = null;
