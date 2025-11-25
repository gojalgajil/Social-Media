import express from "express";
import { authenticate } from "../middlewares/auth";
import { prisma } from '../prisma/client';


const router = express.Router();

router.get('/me', authenticate, async (req, res) => {
  const { user } = req as any;

  try {
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        username: true,
        full_name: true,
        email: true,
        photo_profile: true,
        bio: true,
        created_at: true,
        created_by: true,
        updated_at: true,
        updated_by: true
      }
    });

    if (!userData) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({
      message: "User profile",
      user: userData
    });

  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;