import {Router, Request, Response} from "express";
import {User} from "../../Database/Mapper/Entities/user.js";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
    try {
        const user: User[]|null = await User.getUsersFromCacheOrDB();
        console.log("User:", user);
        res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({message: "Failed to fetch users"});
    }
});
export default router;
