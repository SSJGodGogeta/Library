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


    static async getSessionFromCacheOrDB(): Promise<Session[]> {
        if (!sessions) sessions = await Session.find();
        return sessions;
    }

    static clearSessionsCache(): void {
        sessions = null;
        console.log("Cleared Session cache");
    }

    static async getSessionByKey<K extends keyof Session>(keyName: K, keyValue: Session[K]): Promise<Session | undefined> {
        const sessions:Session[] = await Session.getSessionFromCacheOrDB();
        if (!sessions) return undefined;
        return sessions.find(session => session[keyName] === keyValue);
    }
}

let sessions: Session[]|null = null;