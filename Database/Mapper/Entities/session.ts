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
    @PrimaryGeneratedColumn({name: "session_id"})
    session_id!: number;

    @Column({length: 40, nullable: false})
    ip!: string;

    @Column({length: 250, nullable: false})
    deviceInfo!: string;

    @Column({length: 255, nullable: false})
    token!: string;

    @Column({type: 'datetime', nullable: false})
    created!: Date;

    @Column({type: 'datetime', nullable: false})
    last_used!: Date;

    @ManyToOne('User', (user: User) => user.user_id)
    @JoinColumn({
        name: 'user_user_id',
        referencedColumnName: 'user_id',
        foreignKeyConstraintName: 'fk_session_user',
    })
    user!: User;


    static async getSessionFromCacheOrDB(): Promise<Session[]> {
        if (!sessions) sessions = await Session.find({
            relations: {
                user: true
            }
        });
        return sessions;
    }

    static async resetSessionsCache(): Promise<void> {
        sessions = null;
        console.log("Reset Session cache");
        await this.getSessionFromCacheOrDB();
    }

    static async getSessionByKey<K extends keyof Session>(keyName: K, keyValue: Session[K]): Promise<Session | undefined> {
        const sessions: Session[] = await Session.getSessionFromCacheOrDB();
        if (!sessions) return undefined;
        return sessions.find(session => session[keyName] === keyValue);
    }

    static async getSessionByUserId(userId: number): Promise<Session | null> {
        if (!userId) return null;
        return await Session.findOne({
            relations: {
                user: true,
            },
            where: {
                user: {
                    user_id: userId,
                }
            },
        });
    }

    static async saveSession(session: Session): Promise<void> {
        await session.save();
        await this.resetSessionsCache();
    }
}

let sessions: Session[] | null = null;