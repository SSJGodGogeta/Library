import {BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn,} from 'typeorm';
import {User} from './user.js';
import {Book_Copy} from './book_copy.js';
import {BorrowRecord_Techcode} from '../Techcodes/BorrowRecord_Techcode.js';

@Entity('borrow_record')
export class BorrowRecord extends BaseEntity {
    @PrimaryGeneratedColumn({name: 'borrow_record_id'})
    borrow_record_id!: number;

    @Column({type: 'datetime', nullable: false})
    borrow_date!: Date;

    @Column({type: 'datetime', nullable: false})
    return_date!: Date;

    @Column({length: '50', nullable: false})
    status!: BorrowRecord_Techcode;

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
        await borrowRecord.save();
        await this.resetBorrowRecordsCache();
    }
}

let borrowRecords: BorrowRecord[] | null = null;
