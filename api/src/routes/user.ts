import express from "express";
import { authenticate } from "../middlewares/auth";

const router = express.Router();

router.get("/me", authenticate, async (req, res) => {
    try {
        // User info is in req.user from authenticate middleware
        const user = (req as any).user;
        if (!user) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        // You can fetch more user details from database if needed
        res.json({
            message: "User profile",
            user: {
                id: user.id,
                // Add other user fields as needed
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
