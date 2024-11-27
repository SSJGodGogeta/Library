import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import {dataSource} from "../Database/dataSource.js";
import {envConfig} from "../Database/envConfig.js";

import "./Routes/authenticationRoute.js"
import "./Routes/bookCopyRoute.js"
import "./Routes/bookRoute.js";
import "./Routes/borrowRecordRoute.js";
import "./Routes/reservationRoute.js"
import "./Routes/sessionRoute.js";
import "./Routes/userRoute.js";
import "./Routes/validateDBRoute.js"
import {initializeRoutes} from "./routeTools.js";


envConfig.validateEnvConfig();
dataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!");
    })
    .catch((error) => {
        console.error("Error during Data Source initialization:", error);
        console.error("Terminating");
        process.exit(1);
    });

const app = express();


app.use(cors({
    origin: `http://${envConfig.FRONTEND_HOST}:${envConfig.FRONTEND_PORT}`,
    credentials: true, // allow sending credentials
}));
app.use(express.json());
app.use(cookieParser());

const server = app.listen(envConfig.FRONTEND_PORT, () => {
    console.log(`Server running on http://${envConfig.FRONTEND_HOST}:${envConfig.FRONTEND_PORT}`);
});

await initializeRoutes(app);


async function shutdown() {
    console.log("Shutting down server...");
    server.close(() => {
        console.log("HTTP server closed.");
    });

    try {
        await dataSource.destroy();
        console.log("Database connection closed.");
        process.exit(0); // Success exit code
    } catch (error) {
        console.error("Error during shutdown:", error);
        process.exit(1); // Failure exit code
    }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);