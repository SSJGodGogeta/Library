import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    BaseEntity,
} from 'typeorm';

import {PermissionTechcode} from "../Techcodes/PermissionTechcode.js";

@Entity('user')
export class User extends BaseEntity {
    @PrimaryGeneratedColumn({name: "user_id"})
    user_id!: number;

    @Column({length: 75, unique: true, nullable: false})
    email!: string;

    @Column({length: 100, nullable: false})
    password!: string;

    @Column({length: 50, nullable: false})
    first_name!: string;

    @Column({length: 50, nullable: false})
    last_name!: string;

    @Column({length: 500, nullable: true})
    imageurl?: string;

    @Column({length: 50, nullable: false})
    permissions!: PermissionTechcode;

    static async getUsersFromCacheOrDB(): Promise<User[]> {
        if (!users) users = await User.find();
        return users;
    }

    static async resetUserCache(): Promise<void> {
        users = null;
        console.log("Reset User cache");
        await this.getUsersFromCacheOrDB();
    }

    static async getUserByKey<K extends keyof User>(keyName: K, keyValue: User[K]): Promise<User | undefined> {
        const users: User[] = await User.getUsersFromCacheOrDB();
        if (!users) return undefined;
        return users.find(user => user[keyName] === keyValue);
    }

    static async saveUser(user: User): Promise<void> {
        await user.save();
        await this.resetUserCache();
    }
}

let users: User[] | null = null;
