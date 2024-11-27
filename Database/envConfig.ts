import * as dotenv from "dotenv";
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

    static BACKEND_API_PORT: string = process.env.BACKEND_API_PORT || "";
    static BACKEND_API_HOST: string = process.env.BACKEND_API_HOST || "";

    /**
     * Ensures that all EnvConfig variables have a value.
     */
    public static validateEnvConfig() {
        for (const [key, value] of Object.entries(envConfig)) {
            if (typeof value === "string" && value === "") {
                throw new Error(`EnvConfig error: ${key} is not set or does not exist.`);
            }
        }
        console.log("EnvConfig loaded successfully.");
    }
}