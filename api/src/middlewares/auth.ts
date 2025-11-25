import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { prisma } from '../prisma/client';

export async function authenticate(req: Request, res: Response, next: NextFunction){
    console.log("New auth middleware called");
    console.log(req.headers.authorization?.split(" "));


    const token = req.headers.authorization?.split(" ")[1];
    if (!token){
        res.status(401).json({message: "Unauthorized"});
        return;
    }

    try {
        const decoded = verifyToken(token);
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                username: true,
                full_name: true,
                photo_profile: true,
            },
        });

        if (!user) {
            res.status(401).json({message: "User not found"});
            return;
        }

        (req as any).user = {
            ...user,
            full_name: user.full_name || user.username || "User",
        };
        next();
    } catch (error) {
        res.status(401).json({message: "Invalid token"});
        return;
    }
}
