import { DataSource } from "typeorm";
import {envConfig} from "./envConfig.js";

export const dataSource: DataSource = new DataSource({
    type: "mysql",
    host: envConfig.DB_HOST,
    port: envConfig.DB_PORT,
    username: envConfig.DB_USERNAME,
    password: envConfig.DB_PASSWORD,
    database: envConfig.DB_NAME,
    synchronize: false,
    logging: true,
    entities: ["Dist/Database/Mapper/Entities/*.js"],
    subscribers: [],
});
