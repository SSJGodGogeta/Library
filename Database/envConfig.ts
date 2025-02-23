import * as dotenv from "dotenv";
import * as fs from "fs";
import path from "path";
import {fileURLToPath} from "url";
// Load environment variables from .env file
dotenv.config();

export class envConfig {
    // If you add a new static variable here, remember to update the env.sample as well!
    // Database connection
    static DB_HOST: string = process.env.DB_HOST || "";
    static DB_PORT: number = parseInt(process.env.DB_PORT || "0");
    static DB_USERNAME: string = process.env.DB_USERNAME || "";
    static DB_PASSWORD: string = process.env.DB_PASSWORD || "";
    static DB_NAME: string = process.env.DB_NAME || "";

    static FRONTEND_PORT: string = process.env.FRONTEND_PORT || "";
    static FRONTEND_HOST: string = process.env.FRONTEND_HOST || "";

    static BACKEND_API_PORT: string = process.env.BACKEND_API_PORT || "";
    static BACKEND_API_HOST: string = process.env.BACKEND_API_HOST || "";
    static STAGE_BUILD: boolean = (process.env.STAGE_BUILD?.trim() == "true");

    /**
     * Ensures that all EnvConfig variables have a value.
     */
    public static validateEnvConfig() {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);

        const envFilePath = path.resolve(__dirname, '../../.env');
        console.log(envFilePath);
        if (fs.existsSync(envFilePath)) {
            console.log(`.env file exists.\nLoading configuration from: ${envFilePath}`);
            dotenv.config({path: envFilePath});
        } else {
            console.error('.env file does not exist.');
            // Handle the case where the .env file is missing
            // For example, throw an error or provide default values
            throw new Error(`.env file is missing. Please ensure that you have one file named ".env" in: ${envFilePath}`);
        }
        for (const [key, value] of Object.entries(envConfig)) {
            if (typeof value === "string" && value === "") {
                throw new Error(`EnvConfig error: ${key} is not set or does not exist.`);
            }
        }
        console.log("EnvConfig loaded successfully.");
    }
}