import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import {dataSource} from "../Database/dataSource.js";
import {envConfig} from "../Database/envConfig.js";

// Routes
import userRoute from "./Routes/userRoute.js";
import DatabaseTools from "./Routes/databaseTools.js";
import bookRoute from "./Routes/bookRoute.js";
import bookCopyRoutes from "./Routes/bookCopyRoute.js";
import borrowRecordRoutes from "./Routes/borrowRecordRoute.js";
import reservationRoute from "./Routes/reservationRoute.js";
import sessionRoute from "./Routes/sessionRoute.js";
// Validate EnvConfig
envConfig.validateEnvConfig();
// From here on, we expect that each Environment variable is set

// Initialize TypeORM Data Source
dataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!");
    })
    .catch((error) => {
        console.error("Error during Data Source initialization:", error);
        console.error("Terminating");
        process.exit(1); // Will close the app with code 1
    });

const app = express();
app.use(cors({
    origin: `http://${envConfig.FRONTEND_HOST}:${envConfig.FRONTEND_PORT}`, // url of the frontend app. adapt as needed
    credentials: true, // allow sending credentials
}));
app.use(express.json());
// use cookieParser to access the cookies, send with the request
app.use(cookieParser());

// Start Frontend Server:
const server = app.listen(envConfig.FRONTEND_PORT, () => {
    console.log(`Server running on http://${envConfig.FRONTEND_HOST}:${envConfig.FRONTEND_PORT}`);
});
// Add Routes here:
app.use("/user", userRoute);
app.use("/book", bookRoute);
app.use("/validateDB", DatabaseTools);
app.use("/bookCopy", bookCopyRoutes);
app.use("/borrowRecord", borrowRecordRoutes);
app.use("/reservation", reservationRoute);
app.use("/session", sessionRoute);


// Graceful shutdown handling
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

process.on('SIGINT', shutdown); // SIGINT and SIGTERM are commands that get executed in the background f.ex if u press Ctr+C in the console to stop the current process
process.on('SIGTERM', shutdown); // Had this in Betriebssystem ;)
/*
NOTE: For everyone: stop the app via CTRL+C instead of using the vs code / Webstorm feature to stop the app using the red button.
 Reason: The Red button kills the process instantly and doesnt allow shutdown() to run meaning that u still have a connection to the database!
 This can lead to leaks and performance issues
 */