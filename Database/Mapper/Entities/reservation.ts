import {BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn,} from 'typeorm';
import {User} from './user.js';
import {Book} from './book.js';

@Entity('reservation')
export class Reservation extends BaseEntity {
    @PrimaryGeneratedColumn({name: 'reservation_id'})
    reservation_id!: number;

    @Column({type: 'datetime', nullable: false})
    reservation_date!: Date;

    @ManyToOne('Book', (book: Book) => book.book_id)
    @JoinColumn({
        name: 'book_book_id',
        referencedColumnName: 'book_id',
        foreignKeyConstraintName: 'fk_reservation_book1',
    })
    book!: Book;

    @ManyToOne('User', (user: User) => user.user_id)
    @JoinColumn({
        name: 'user_user_id',
        referencedColumnName: 'user_id',
        foreignKeyConstraintName: 'fk_reservation_user1',
    })
    user!: User;

    static async getReservationFromCacheOrDB(): Promise<Reservation[]> {
        if (!reservations) reservations = await Reservation.find({
            relations: {
                book: true,
                user: true,
            }
        });
        return reservations;
    }

    static clearReservationsCache(): void {
        reservations = null;
        console.log("Cleared Reservations cache");
    }

    static async getReservationsByKey<K extends keyof Reservation>(keyName: K, keyValue: Reservation[K]): Promise<Reservation | undefined> {
        const reservations: Reservation[] = await Reservation.getReservationFromCacheOrDB();
        if (!reservations) return undefined;
        return reservations.find(reservation => reservation[keyName] === keyValue);
    }
}

let reservations: Reservation[] | null = null;
