import {Express, NextFunction, Request, Response, Router} from "express";
import {authenticate} from "./authenticationMiddleware.js";
import {sendResponseAsJson} from "./Routes/tools/sendResponseAsJson.js";

export let routes: { path: string; router: Router }[] = [];

function createEntityRoutes<Entity>(
    EntityModel: {
        getAllFromCacheOrDB: () => Promise<Entity[] | null>;
        getByKey: <K extends keyof Entity>(keyName: K, keyValue: Entity[K]) => Promise<Entity | undefined>;
    },
    entityName: string, // has to be the exact name of the entity id. F.ex borrow_record
    options?: { authenticate: boolean } // Add options to control authentication
) {
    const router = Router();
    const requireAuth = options?.authenticate ?? true;

    // Best practice to export the function and reference it in the route.
    router.get("/", optionalAuthenticate(requireAuth), getAllEntries);
    router.get("/:id", optionalAuthenticate(requireAuth), getSingleEntry);

    /**
     * Retrieves all entries of the specified entity type from the cache or database.
     *
     * @param {Request} _req - The HTTP request object (not used in this handler).
     * @param {Response} res - The HTTP response object used to send the response.
     * @example
     * // Example usage
     * // GET /api/entity/
     * fetch('/api/entity/')
     *   .then(response => response.json())
     *   .then(data => console.log(data));
     */
    async function getAllEntries(_req: Request, res: Response) {
        try {
            const entities: Entity[] | null = await EntityModel.getAllFromCacheOrDB();
            if (!entities) sendResponseAsJson(res, 404, "No Entities found!1");
            else {
                sendResponseAsJson(res, 200, "Success", entities);
            }
        } catch (error) {
            sendResponseAsJson(res, 500, `Failed to fetch ${entityName}s`);
            console.error(error);
        }
    }

    /**
     * Retrieves a single entity by its unique ID.
     *
     * @param {Request} req - The HTTP request object containing the entity ID as a route parameter.
     * @param {Response} res - The HTTP response object used to send the response.
     * @example
     * // Example usage
     * // GET /api/entity/123
     * fetch('/api/entity/123')
     *   .then(response => response.json())
     *   .then(data => console.log(data))
     *   .catch(err => console.error(err));
     */
    async function getSingleEntry(req: Request, res: Response) {
        try {
            const entityId = parseInt(req.params.id);
            // Cast key name dynamically to a keyof Entity
            //TODO this needs to be changed after renaming the entity attributes of typeorm
            const entity = await EntityModel.getByKey(
                `${entityName}_id` as keyof Entity, // Type assertion ensures this is treated as key of Entity
                entityId as Entity[keyof Entity]   // Type-safe value of key
            );
            if (!entity) sendResponseAsJson(res, 404, "No Entities found!2");
            else {
                sendResponseAsJson(res, 200, "Success", entity);
            }
        } catch (error) {
            sendResponseAsJson(res, 500, `Failed to fetch ${entityName}`);
            console.error(error);
        }
    }

    return router;
}


/**
 * Initializes and registers routes on the Express application.
 * This function loops through an array of routes and registers each route
 * by calling `app.use()` for each path and its corresponding router.
 *
 * @param {Express} app - The Express application instance.
 * @returns {Promise<void>} - A promise that resolves when all routes are registered.
 *
 * @example
 * // Example usage in an Express app:
 * import express from 'express';
 * import { initializeRoutes } from './routesInitializer';
 *
 * const app = express();
 *
 * // Initialize routes
 * initializeRoutes(app)
 *     .then(() => console.log('Routes initialized'))
 *     .catch(err => console.error('Error initializing routes:', err));
 */
export async function initializeRoutes(app: Express): Promise<void> {
    // Import route files
    routes.forEach(({path, router}) => {
        console.log(`Registering route: ${path}`);
        app.use(path, router);
    });
}

/**
 * Middleware to conditionally apply authentication based on the `required` flag.
 * If `required` is `true`, the `authenticate` function is called to perform authentication.
 * If `required` is `false`, the middleware skips authentication and proceeds to the next middleware.
 *
 * @param {boolean} required - A flag to determine whether authentication is required.
 * @returns {Function} - A middleware function that either authenticates the request or skips it.
 *
 * @example
 * // Example usage in an Express route:
 * app.get('/profile', optionalAuthenticate(true), (req, res) => {
 *     res.json({ message: 'Authenticated access to profile' });
 * });
 *
 * app.get('/public', optionalAuthenticate(false), (req, res) => {
 *     res.json({ message: 'Public access without authentication' });
 * });
 */
export function optionalAuthenticate(required: boolean): (req: Request, res: Response, next: NextFunction) => Promise<void> {
    return async (req: Request, res: Response, next: NextFunction) => {
        if (required) {
            await authenticate(req, res, next); // Use the existing authentication logic
        } else {
            next(); // Skip authentication
        }
    };
}

export default createEntityRoutes;