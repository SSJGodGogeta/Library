// Dummy route for testing db.

import {Router, Request, Response} from "express";
import {User} from "../../Database/Mapper/Entities/user.js";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
    try {
        const user: User[]|null = await User.find();
        console.log("User: ", user);
    } catch (error) {
        console.error("Error fetching roles:", error);
        res.status(500).json({message: "Failed to fetch roles"});
    }
});
export default router;
