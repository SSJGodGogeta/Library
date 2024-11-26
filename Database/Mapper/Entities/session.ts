import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    BaseEntity,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import {User} from './user.js';

@Entity('session')
export class Session extends BaseEntity {
    @PrimaryGeneratedColumn({ name: "session_id" })
    session_id!: number;

    @Column({ length: 40, nullable: false })
    ip!: string;

    @Column({ length: 255, nullable: false })
    token!: string;

    @Column({ type: 'datetime', nullable: false })
    created!: Date;

    @Column({ type: 'datetime', nullable: false })
    last_used!: Date;

    @ManyToOne('User', (user: User) => user.user_id)
    @JoinColumn({
        name: 'user_user_id',
        referencedColumnName: 'user_id',
        foreignKeyConstraintName: 'fk_session_user',
    })
    user!: User;
}
