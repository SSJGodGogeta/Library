import {
    Entity,
    Column,
     BaseEntity, PrimaryColumn,
} from 'typeorm';
import {Availability_Techcode} from "../Techcodes/Availability_Techcode.js";

@Entity('book')
export class Book extends BaseEntity {
    @PrimaryColumn({ name: "book_id" })
    book_id!: number;

    @Column({ length: '60', nullable: false })
    title!: String;

    @Column({ length: '2000', nullable: true })
    description?: String;

    @Column({ length: '30', nullable: true })
    publisher?: String;

    @Column({ length: '60', nullable: true })
    author?: String;

    @Column({ nullable: true })
    year?: number;

    @Column({ nullable: true })
    edition?: number;

    @Column({ length: '13', nullable: false })
    isbn!: String;

    @Column({ length: '3', nullable: true })
    language_code?: String;

    @Column({ nullable: true })
    total_copies?: number;

    @Column({ nullable: true })
    available_copies?: number;

    @Column({ nullable: true })
    average_rating?: number;

    @Column({ nullable: true })
    times_borrowed?: number;

    @Column({ length: '50', nullable: false })
    availability!: Availability_Techcode;
}