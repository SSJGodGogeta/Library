import {Express, Request, Response, Router} from "express";
import {authenticate} from "./authenticationMiddleware.js";

function createEntityRoutes<Entity>(
    EntityModel: {
        getAllFromCacheOrDB: () => Promise<Entity[] | null>;
        getByKey: <K extends keyof Entity>(keyName: K, keyValue: Entity[K]) => Promise<Entity | undefined>;
    },
    entityName: string // has to be the exact name of the entity id. F.ex borrow_record
) {
    const router = Router();
// Best practice to export the function and reference it in the route.
    router.get("/", authenticate, getAllEntries);

    router.get("/:id", authenticate, getSingleEntry);

    async function getAllEntries(_req: Request, res: Response) {
        try {
            const entities: Entity[] | null = await EntityModel.getAllFromCacheOrDB();
            if (!entities) sendResponseAsJson(res, 404, "No Entities found!");
            else {
                sendResponseAsJson(res, 200, "Success", entities);
            }
        } catch (error) {
            sendResponseAsJson(res, 500, `Failed to fetch ${entityName}s`);
            console.error(error);
        }
    }


    async function getSingleEntry(req: Request, res: Response) {
        try {
            const entityId = parseInt(req.params.id);
            // Cast key name dynamically to a keyof Entity
            const entity = await EntityModel.getByKey(
                `${entityName}_id` as keyof Entity, // Type assertion ensures this is treated as keyof Entity
                entityId as Entity[keyof Entity]   // Type-safe value
            );
            if (!entity) sendResponseAsJson(res, 404, "No Entities found!");
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

export function sendResponseAsJson(res: Response, code: number, message: string, entities: any = null) {
    res.status(code).json({
        message: message,
        entities: entities
    });
}

export let routes: { path: string; router: Router }[] = [];

export async function initializeRoutes(app: Express): Promise<void> {
    // Import route files
    routes.forEach(({path, router}) => {
        console.log(`Registering route: ${path}`);
        app.use(path, router);
    });
}

export default createEntityRoutes;

