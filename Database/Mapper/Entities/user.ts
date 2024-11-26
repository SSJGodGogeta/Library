import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    BaseEntity,
} from 'typeorm';

import {Permission_Techcode} from "../Techcodes/Permission_Techcode.js";

@Entity('user')
export class User extends BaseEntity {
    @PrimaryGeneratedColumn({ name: "user_id" })
    user_id!: number;

    @Column({ length: 75, unique: true, nullable: false })
    email!: string;

    @Column({ length: 100, nullable: false })
    password!: string;

    @Column({ length: 50, nullable: false })
    first_name!: string;

    @Column({ length: 50, nullable: false })
    last_name!: string;

    @Column({ length: 500, nullable: true })
    imageurl?: string;

    @Column({ length: 50, nullable: false })
    permissions!: Permission_Techcode;
}