import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    BaseEntity,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import {User} from './user.js';
import {Book_Copy} from './book_copy.js';
import { BorrowRecord_Techcode } from '../Techcodes/BorrowRecord_Techcode.js';

@Entity('borrow_record')
export class BorrowRecord extends BaseEntity {
    @PrimaryGeneratedColumn({ name: 'borrow_record_id' })
    borrow_record_id!: number;

    @Column({ type: 'datetime', nullable: false })
    borrow_date!: Date;

    @Column({ type: 'datetime', nullable: false })
    return_date!: Date;

    @Column({ length: '50', nullable: false })
    status!: BorrowRecord_Techcode;

    @ManyToOne('Book_Copy', (book_copy:Book_Copy) => book_copy.book_copy_id)
    @JoinColumn({
        name: 'book_copy_book_copy_id',
        referencedColumnName: 'book_copy_id',
        foreignKeyConstraintName: 'fk_borrow_record_book_copy1'
    })
    book_copy!: Book_Copy;

    @ManyToOne('User', (user:User) => user.user_id)
    @JoinColumn({
        name: 'user_user_id',
        referencedColumnName: 'user_id',
        foreignKeyConstraintName: 'fk_borrow_record_user1'
    })
    user!: User;
}
