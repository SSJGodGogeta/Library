import {BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn,} from 'typeorm';
import {User} from './user.js';
import {Book} from './book.js';
import {BorrowRecord} from "./borrow_record.js";
import {Book_Copy} from "./book_copy.js";

@Entity('reservation')
export class Reservation extends BaseEntity {
    @PrimaryGeneratedColumn({name: 'reservation_id'})
    reservation_id!: number;

    @Column({type: 'datetime', nullable: false})
    startDate!: Date;

    @Column({type: 'datetime', nullable: false})
    returnDate!: Date;

    @ManyToOne('Book', (book: Book) => book.book_id)
    @JoinColumn({
        name: 'book_book_id',
        referencedColumnName: 'book_id',
        foreignKeyConstraintName: 'fk_reservation_book1',
    })
    book!: Book;

    @ManyToOne('Book_Copy', (book: Book_Copy) => book.book_copy_id)
    @JoinColumn({
        name: 'bookCopyId',
        referencedColumnName: 'book_copy_id',
        foreignKeyConstraintName: 'fk_reservation_book_copy1',
    })
    bookCopyId!: Book_Copy;

    @ManyToOne('User', (user: User) => user.user_id)
    @JoinColumn({
        name: 'user_user_id',
        referencedColumnName: 'user_id',
        foreignKeyConstraintName: 'fk_reservation_user1',
    })
    user!: User;

    @OneToOne('borrow_record', (borrowRecord: BorrowRecord) => borrowRecord.borrow_record_id)
    @JoinColumn({
        name: 'borrowRecordId',
        referencedColumnName: 'borrow_record_id',
        foreignKeyConstraintName: 'fk_reservation_borrowRecord',
    })
    borrowRecord!: BorrowRecord;

    static async getReservationFromCacheOrDB(): Promise<Reservation[]> {
        if (!reservations) reservations = await Reservation.find({
            relations: {
                book: true,
                user: true,
            }
        });
        return reservations;
    }

    static async resetReservationsCache(): Promise<void> {
        reservations = null;
        console.log("Reset Reservations cache");
        await this.getReservationFromCacheOrDB();
    }

    static async getReservationsByKey<K extends keyof Reservation>(keyName: K, keyValue: Reservation[K]): Promise<Reservation | undefined> {
        const reservations: Reservation[] = await Reservation.getReservationFromCacheOrDB();
        if (!reservations) return undefined;
        return reservations.find(reservation => reservation[keyName] === keyValue);
    }

    static async saveReservation(reservation: Reservation): Promise<void> {
        await reservation.save();
        await this.resetReservationsCache();
    }
}

let reservations: Reservation[] | null = null;
