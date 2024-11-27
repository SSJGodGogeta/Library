import {Request, Response, Router} from "express";

function createEntityRoutes<Entity>(
    EntityModel: {
        getAllFromCacheOrDB: () => Promise<Entity[] | null>;
        getByKey: <K extends keyof Entity>(keyName: K, keyValue: Entity[K]) => Promise<Entity | undefined>;
    },
    entityName: string // has to be the exact name of the entity id. F.ex borrow_record
) {
    const router = Router();
// Best practice to export the function and reference it in the route.
    router.get("/", getAllEntries);

    router.get("/:id", getSingleEntry);

    async function getAllEntries(_req: Request, res: Response) {
        try {
            const entities: Entity[] | null = await EntityModel.getAllFromCacheOrDB();
            console.log(`${entityName}s:`, entities);
            res.status(200).json(entities);
        } catch (error) {
            console.error(`Error fetching ${entityName}s:`, error);
            res.status(500).json({message: `Failed to fetch ${entityName}s`});
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
            console.log(`${entityName}:`, entity);
            res.status(200).json(entity);
        } catch (error) {
            console.error(`Error fetching ${entityName}:`, error);
            res.status(500).json({message: `Failed to fetch ${entityName}`});
        }
    }

    return router;
}

export default createEntityRoutes;
